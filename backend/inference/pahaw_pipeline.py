"""
inference/pahaw_pipeline.py — PaHaW classical ML pipeline wrapper.

Handles .svc digitizer stroke data (X Y timestamp pressure azimuth altitude).
This pipeline is COMPLETELY isolated from the photo-upload flow.
It appears ONLY on the /research Model Zoo page.
"""

import io
import logging
import os
import random
from typing import Any

import numpy as np
import pandas as pd
from scipy.signal import welch
import pywt
import nolds

from .config import PAHAW_MODEL_FILE

logger = logging.getLogger(__name__)

_pahaw_model = None
_pahaw_is_mock = True
_pipeline_obj = None


def load_pahaw() -> bool:
    """Load the PaHaW classical ML pipeline. Returns True if real model loaded."""
    global _pahaw_model, _pahaw_is_mock, _pipeline_obj

    if not os.path.exists(PAHAW_MODEL_FILE):
        logger.warning(
            "PaHaW model not found at %s — using mock inference.", PAHAW_MODEL_FILE
        )
        _pahaw_is_mock = True
        return False

    try:
        import joblib  # noqa: PLC0415

        obj = joblib.load(PAHAW_MODEL_FILE)
        _pipeline_obj = obj
        if isinstance(obj, dict):
            if "model" in obj:
                _pahaw_model = obj["model"]
            elif "pipeline" in obj:
                _pahaw_model = obj["pipeline"]
            else:
                for val in obj.values():
                    if hasattr(val, "predict"):
                        _pahaw_model = val
                        break
                if _pahaw_model is None:
                    raise ValueError(f"No predict method found in dict keys: {list(obj.keys())}")
        else:
            _pahaw_model = obj

        _pahaw_is_mock = False
        logger.info("PaHaW pipeline loaded from %s", PAHAW_MODEL_FILE)
        return True
    except Exception as exc:
        logger.error("Failed to load PaHaW pipeline: %s — falling back to mock.", exc)
        _pahaw_model = None
        _pahaw_is_mock = True
        return False


def _parse_svc(file_bytes: bytes) -> pd.DataFrame:
    """
    Parse .svc file format: tab-separated columns
    X  Y  timestamp  button  azimuth  altitude pressure
    """
    try:
        text = file_bytes.decode("utf-8", errors="replace")
        import io
        f = io.StringIO(text)
        first_line = f.readline().strip()
        f.seek(0)
        
        try:
            int(first_line)
            df = pd.read_csv(f, sep=r'\s+', skiprows=1, header=None)
        except ValueError:
            df = pd.read_csv(f, sep=r'\s+', header=None)
            
        SVC_COLS = ['y', 'x', 'timestamp', 'button', 'azimuth', 'altitude', 'pressure']
        n_cols = df.shape[1]
        df.columns = SVC_COLS[:n_cols]
        df['timestamp'] = (df['timestamp'] - df['timestamp'].iloc[0]) / 1000.0
        return df
    except Exception as e:
        logger.error("Failed to parse SVC: %s", e)
        raise ValueError(f"Failed to parse SVC: {e}")

# ===========================================================================
# Advanced Feature Extraction (from PaHaW V3 Notebook)
# ===========================================================================

def compute_velocity(x, y, t):
    dx = np.diff(x); dy = np.diff(y); dt = np.diff(t)
    dt = np.where(dt == 0, 1e-6, dt)
    return np.sqrt(dx**2 + dy**2) / dt

def compute_acceleration(speed, t):
    dt = np.diff(t[:-1])
    dt = np.where(dt == 0, 1e-6, dt)
    return np.diff(speed) / dt

def compute_jerk(accel, t):
    dt = np.diff(t[:-2])
    dt = np.where(dt == 0, 1e-6, dt)
    return np.diff(accel) / dt

def stat_features(arr, prefix):
    if len(arr) < 2:
        return {f'{prefix}_mean': 0.0, f'{prefix}_std': 0.0, f'{prefix}_max': 0.0,
                f'{prefix}_median': 0.0, f'{prefix}_cv': 0.0, f'{prefix}_p25': 0.0, f'{prefix}_p75': 0.0}
    m = float(np.mean(arr)); s = float(np.std(arr))
    return {
        f'{prefix}_mean': m,
        f'{prefix}_std': s,
        f'{prefix}_max': float(np.max(np.abs(arr))),
        f'{prefix}_median': float(np.median(arr)),
        f'{prefix}_cv': s / (abs(m) + 1e-6),
        f'{prefix}_p25': float(np.percentile(arr, 25)),
        f'{prefix}_p75': float(np.percentile(arr, 75)),
    }

def rms(arr):
    return float(np.sqrt(np.mean(arr**2))) if len(arr) > 0 else 0.0

def tremor_power_ratio(sig, fs=150.0, band=(4, 6)):
    if len(sig) < 32:
        return 0.0
    freqs, psd = welch(sig, fs=fs, nperseg=min(64, len(sig)//2))
    total = np.trapz(psd, freqs) if hasattr(np, 'trapz') else np.trapezoid(psd, freqs)
    if total == 0:
        return 0.0
    mask = (freqs >= band[0]) & (freqs <= band[1])
    return float((np.trapz(psd[mask], freqs[mask]) if hasattr(np, 'trapz') else np.trapezoid(psd[mask], freqs[mask])) / total)

def high_freq_power_ratio(sig, fs=150.0, band=(6, 12)):
    if len(sig) < 32:
        return 0.0
    freqs, psd = welch(sig, fs=fs, nperseg=min(64, len(sig)//2))
    total = np.trapz(psd, freqs) if hasattr(np, 'trapz') else np.trapezoid(psd, freqs)
    if total == 0:
        return 0.0
    mask = (freqs >= band[0]) & (freqs <= band[1])
    return float((np.trapz(psd[mask], freqs[mask]) if hasattr(np, 'trapz') else np.trapezoid(psd[mask], freqs[mask])) / total)

def dfa_alpha(sig):
    if len(sig) < 20:
        return 0.0
    try:
        return float(nolds.dfa(sig))
    except Exception:
        return 0.0

def lyapunov_exp(sig):
    if len(sig) < 40:
        return 0.0
    try:
        return float(nolds.lyap_r(sig[:500]))
    except Exception:
        return 0.0

def sample_entropy(sig, m=2, r_factor=0.2):
    if len(sig) < 20:
        return 0.0
    sig = sig[:200]
    r = r_factor * np.std(sig)
    N = len(sig)
    def _phi(m_len):
        count = 0
        for i in range(N - m_len):
            template = sig[i:i+m_len]
            others = np.array([sig[j:j+m_len] for j in range(N - m_len) if j != i])
            if len(others) == 0:
                continue
            dists = np.max(np.abs(others - template), axis=1)
            count += np.sum(dists <= r)
        return count
    try:
        A = _phi(m+1); B = _phi(m)
        return float(-np.log((A + 1e-10) / (B + 1e-10)))
    except Exception:
        return 0.0

def wavelet_energy_ratios(sig, wavelet='db4', levels=5):
    if len(sig) < 2**levels:
        return [0.0] * levels
    coeffs = pywt.wavedec(sig, wavelet, level=levels)
    energies = [np.sum(c**2) for c in coeffs]
    total = sum(energies) + 1e-10
    return [e / total for e in energies[:levels]]

def extract_stroke_features(df):
    strokes = []; in_stroke = False; stroke_start = None
    for i, row in df.iterrows():
        if row['button'] == 1 and not in_stroke:
            in_stroke = True; stroke_start = i
        elif row['button'] == 0 and in_stroke:
            in_stroke = False
            strokes.append(df.loc[stroke_start:i-1])
    if in_stroke:
        strokes.append(df.loc[stroke_start:])

    keys = ['stroke_count', 'stroke_len_mean', 'stroke_len_std',
            'stroke_dur_mean', 'stroke_dur_std',
            'inter_stroke_gap_mean', 'inter_stroke_gap_std']
    if not strokes:
        return {k: 0.0 for k in keys}

    lengths = []; durations = []; gaps = []
    prev_end = None
    for s in strokes:
        dx = np.diff(s['x'].values); dy = np.diff(s['y'].values)
        lengths.append(float(np.sum(np.sqrt(dx**2 + dy**2))))
        start_t = float(s['timestamp'].min()); end_t = float(s['timestamp'].max())
        durations.append(end_t - start_t)
        if prev_end is not None:
            gaps.append(start_t - prev_end)
        prev_end = end_t

    return {
        'stroke_count': len(strokes),
        'stroke_len_mean': float(np.mean(lengths)) if lengths else 0.0,
        'stroke_len_std': float(np.std(lengths)) if lengths else 0.0,
        'stroke_dur_mean': float(np.mean(durations)) if durations else 0.0,
        'stroke_dur_std': float(np.std(durations)) if durations else 0.0,
        'inter_stroke_gap_mean': float(np.mean(gaps)) if gaps else 0.0,
        'inter_stroke_gap_std': float(np.std(gaps)) if gaps else 0.0,
    }

def tilt_features(df):
    feats = {}
    for col in ['azimuth', 'altitude']:
        if col in df.columns:
            arr = df[col].values.astype(float)
            on_mask = df['button'].values == 1
            arr_on = arr[on_mask]
            if len(arr_on) > 1:
                feats[f'{col}_mean'] = float(np.mean(arr_on))
                feats[f'{col}_std'] = float(np.std(arr_on))
                feats[f'{col}_range'] = float(arr_on.max() - arr_on.min())
            else:
                feats[f'{col}_mean'] = feats[f'{col}_std'] = feats[f'{col}_range'] = 0.0
        else:
            feats[f'{col}_mean'] = feats[f'{col}_std'] = feats[f'{col}_range'] = 0.0
    return feats

def extract_task_features(df):
    feats = {}
    x = df['x'].values.astype(float)
    y = df['y'].values.astype(float)
    t = df['timestamp'].values.astype(float)
    btn = df['button'].values
    on_mask = btn == 1
    air_mask = btn == 0
    x_on = x[on_mask]; y_on = y[on_mask]; t_on = t[on_mask]

    # Velocity / acceleration / jerk
    if len(x_on) > 2:
        speed = compute_velocity(x_on, y_on, t_on)
        feats.update(stat_features(speed, 'vel'))
        feats['vel_rms'] = rms(speed)
        feats['vel_tremor_ratio'] = tremor_power_ratio(speed)
        feats['vel_highfreq_ratio'] = high_freq_power_ratio(speed)
        feats['vel_dfa'] = dfa_alpha(speed)
        feats['vel_lyap'] = lyapunov_exp(speed)

        if len(speed) > 2:
            accel = compute_acceleration(speed, t_on)
            feats.update(stat_features(accel, 'acc'))
            feats['acc_rms'] = rms(accel)
            feats['acc_tremor_ratio'] = tremor_power_ratio(accel)

            if len(accel) > 2:
                jerk = compute_jerk(accel, t_on)
                feats.update(stat_features(jerk, 'jerk'))
                feats['jerk_rms'] = rms(jerk)
            else:
                for k in ['jerk_mean','jerk_std','jerk_max','jerk_median','jerk_cv','jerk_p25','jerk_p75','jerk_rms']:
                    feats[k] = 0.0
        else:
            for k in ['acc_mean','acc_std','acc_max','acc_median','acc_cv','acc_p25','acc_p75','acc_rms','acc_tremor_ratio',
                      'jerk_mean','jerk_std','jerk_max','jerk_median','jerk_cv','jerk_p25','jerk_p75','jerk_rms']:
                feats[k] = 0.0
    else:
        for prefix in ['vel', 'acc', 'jerk']:
            for sfx in ['mean','std','max','median','cv','p25','p75','rms']:
                feats[f'{prefix}_{sfx}'] = 0.0
        for k in ['vel_tremor_ratio','vel_highfreq_ratio','vel_dfa','vel_lyap','acc_tremor_ratio']:
            feats[k] = 0.0

    # Pressure
    if 'pressure' in df.columns:
        p_on = df['pressure'].values[on_mask].astype(float)
        if len(p_on) > 1:
            feats.update(stat_features(p_on, 'press'))
            feats['press_range'] = float(p_on.max() - p_on.min())
            feats['press_rms'] = rms(p_on)
            feats['press_tremor_ratio'] = tremor_power_ratio(p_on)
            feats['press_dfa'] = dfa_alpha(p_on)
        else:
            for k in ['press_mean','press_std','press_max','press_median','press_cv','press_p25','press_p75',
                      'press_range','press_rms','press_tremor_ratio','press_dfa']:
                feats[k] = 0.0
    else:
        for k in ['press_mean','press_std','press_max','press_median','press_cv','press_p25','press_p75',
                  'press_range','press_rms','press_tremor_ratio','press_dfa']:
            feats[k] = 0.0

    # In-air timing
    total_time = t.max() - t.min() + 1e-6 if len(t) > 0 else 1e-6
    air_time = float(np.sum(air_mask)) / 150.0
    on_time = float(np.sum(on_mask)) / 150.0
    feats['air_time_ratio'] = air_time / total_time
    feats['on_time_ratio'] = on_time / total_time
    feats['total_duration'] = total_time

    air_segs = []
    in_air = False; seg_start = 0
    for i, b in enumerate(btn):
        if b == 0 and not in_air:
            in_air = True; seg_start = i
        elif b == 1 and in_air:
            in_air = False; air_segs.append(i - seg_start)
    if air_segs:
        feats['air_seg_count'] = len(air_segs)
        feats['air_seg_mean'] = float(np.mean(air_segs)) / 150.0
        feats['air_seg_std'] = float(np.std(air_segs)) / 150.0
        feats['air_seg_max'] = float(np.max(air_segs)) / 150.0
    else:
        feats['air_seg_count'] = feats['air_seg_mean'] = feats['air_seg_std'] = feats['air_seg_max'] = 0.0

    # Spatial / micrographia
    if len(x_on) > 1:
        feats['bbox_width'] = float(x_on.max() - x_on.min())
        feats['bbox_height'] = float(y_on.max() - y_on.min())
        feats['bbox_area'] = feats['bbox_width'] * feats['bbox_height']
        dx = np.diff(x_on); dy = np.diff(y_on)
        path_length = float(np.sum(np.sqrt(dx**2 + dy**2)))
        displacement = float(np.sqrt((x_on[-1]-x_on[0])**2 + (y_on[-1]-y_on[0])**2))
        feats['path_length'] = path_length
        feats['displacement'] = displacement
        feats['path_eff'] = displacement / (path_length + 1e-6)
        feats['x_std'] = float(np.std(x_on))
        feats['y_std'] = float(np.std(y_on))
    else:
        for k in ['bbox_width','bbox_height','bbox_area','path_length','displacement','path_eff','x_std','y_std']:
            feats[k] = 0.0

    # Curvature
    if len(x_on) > 3:
        dx = np.diff(x_on); dy = np.diff(y_on)
        ddx = np.diff(dx); ddy = np.diff(dy)
        num = np.abs(dx[:-1]*ddy - dy[:-1]*ddx)
        denom = (dx[:-1]**2 + dy[:-1]**2)**1.5 + 1e-10
        curv = num / denom
        feats.update(stat_features(curv, 'curv'))
        feats['curv_tremor_ratio'] = tremor_power_ratio(curv)
    else:
        for k in ['curv_mean','curv_std','curv_max','curv_median','curv_cv','curv_p25','curv_p75','curv_tremor_ratio']:
            feats[k] = 0.0

    # Direction changes
    if len(x_on) > 2:
        angles = np.arctan2(np.diff(y_on), np.diff(x_on))
        angle_diff = np.abs(np.diff(np.unwrap(angles)))
        feats['dir_changes_count'] = int(np.sum(angle_diff > np.pi/4))
        feats['dir_changes_rate'] = feats['dir_changes_count'] / (total_time + 1e-6)
        feats['angle_diff_mean'] = float(np.mean(angle_diff))
        feats['angle_diff_std'] = float(np.std(angle_diff))
    else:
        feats['dir_changes_count'] = feats['dir_changes_rate'] = feats['angle_diff_mean'] = feats['angle_diff_std'] = 0.0

    # Entropy
    if len(x_on) > 20:
        feats['sampen_x'] = sample_entropy(x_on)
        feats['sampen_y'] = sample_entropy(y_on)
        feats['sampen_vel'] = sample_entropy(compute_velocity(x_on, y_on, t_on)) if len(x_on) > 3 else 0.0
    else:
        feats['sampen_x'] = feats['sampen_y'] = feats['sampen_vel'] = 0.0

    # Wavelet energy (5 levels, x and y)
    if len(x_on) > 32:
        we = wavelet_energy_ratios(x_on, levels=5)
        for i, e in enumerate(we):
            feats[f'wavelet_{i}'] = e
        we2 = wavelet_energy_ratios(y_on, levels=5)
        for i, e in enumerate(we2):
            feats[f'wavelet_y_{i}'] = e
    else:
        for i in range(5):
            feats[f'wavelet_{i}'] = feats[f'wavelet_y_{i}'] = 0.0

    feats.update(extract_stroke_features(df))
    feats.update(tilt_features(df))
    return feats


def _mock_result() -> dict[str, Any]:
    prob = random.uniform(0.3, 0.8)
    pred = "Parkinson" if prob >= 0.5 else "Healthy"
    return {
        "prediction": pred,
        "probability": prob,
        "features_extracted": 16,
        "is_mock": True,
        "note": "Mock result — pahaw_pipeline_v3.joblib not found in backend/models/",
    }


def process_svc_file(file_bytes: bytes) -> dict[str, Any]:
    """
    Run the PaHaW pipeline on raw .svc file bytes.
    Uses the advanced single-task feature padding trick from V3 pipeline.
    """
    if _pahaw_is_mock or _pahaw_model is None or _pipeline_obj is None:
        return _mock_result()

    try:
        df = _parse_svc(file_bytes)
        feats_dict = extract_task_features(df)
        
        # Get V3 pipeline mapping logic
        sc = _pipeline_obj.get('scaler')
        t_idx = _pipeline_obj.get('top_idx')
        all_fnames = _pipeline_obj.get('feat_names')
        
        if not sc or not t_idx or not all_fnames:
            # Fallback for old models
            feature_vec = np.array(list(feats_dict.values())).reshape(1, -1)
            pred_int = _pahaw_model.predict(feature_vec)[0]
            prob = float(_pahaw_model.predict_proba(feature_vec)[0][pred_int]) if hasattr(_pahaw_model, "predict_proba") else 0.99
            confidence = prob
        else:
            # Map into 744 global vector
            fvec = np.zeros(len(all_fnames), dtype=np.float32)
            for i, fname in enumerate(all_fnames):
                key = fname.split('__')[-1] if '__' in fname else fname
                if key in feats_dict:
                    fvec[i] = feats_dict[key]
            
            fvec = np.nan_to_num(fvec, nan=0.0, posinf=0.0, neginf=0.0)
            fvec_sc = sc.transform(fvec.reshape(1, -1))
            fvec_sel = fvec_sc[:, t_idx]
            
            pred_int = _pahaw_model.predict(fvec_sel)[0]
            if hasattr(_pahaw_model, "predict_proba"):
                pred_prob = _pahaw_model.predict_proba(fvec_sel)[0]
                raw_conf = float(pred_prob[pred_int])
                
                # Apply temperature scaling to soften extreme Platt scaling probabilities
                import math
                p = min(max(raw_conf, 0.5001), 0.9999)
                logit = math.log(p / (1 - p))
                T = 2.0 # Temperature > 1 softens towards 0.5
                confidence = 1 / (1 + math.exp(-logit / T))
            else:
                confidence = 0.85 # Muted default

        pred = "Parkinson" if pred_int == 1 else "Healthy"
        
        # Prepare small basic summary for frontend (avoiding huge dicts)
        basic_stats = {
            "Total Samples": len(df),
            "Duration (s)": round(feats_dict.get('total_duration', 0.0), 2),
            "Total Distance (px)": round(feats_dict.get('path_length', 0.0), 1),
            "Avg Velocity": round(feats_dict.get('vel_mean', 0.0), 2),
            "Avg Pressure": round(feats_dict.get('press_mean', 0.0), 2),
            "Tremor Index": round(feats_dict.get('vel_tremor_ratio', 0.0), 3)
        }
        
        return {
            "prediction": pred,
            "probability": confidence,
            "confidence": round(confidence * 100, 2),
            "features_extracted": len(feats_dict),
            "basic_stats": basic_stats,
            "is_mock": False,
        }
    except Exception as exc:
        logger.error("PaHaW inference error: %s", exc)
        raise

def process_manual_features(features: dict[str, float]) -> dict[str, Any]:
    """
    Run the PaHaW pipeline on manually entered features.
    Ensures exact feature order required by the old model (if applicable).
    """
    if _pahaw_is_mock or _pahaw_model is None:
        return _mock_result()

    try:
        # Ensure exact order matching old _extract_features
        ordered_keys = [
            "velocity_mean", "velocity_std", "velocity_max",
            "acceleration_mean", "jerk_mean",
            "curvature_mean", "curvature_std",
            "pressure_mean", "pressure_std", "pressure_min", "pressure_max",
            "azimuth_mean", "altitude_mean",
            "stroke_duration", "total_distance", "num_points"
        ]
        
        missing = [k for k in ordered_keys if k not in features]
        if missing:
            raise ValueError(f"Missing manual features: {missing}")
            
        feature_list = [float(features[k]) for k in ordered_keys]
        feature_vec = np.array(feature_list).reshape(1, -1)

        if hasattr(_pahaw_model, "predict_proba"):
            prob_arr = _pahaw_model.predict_proba(feature_vec)[0]
            prob = float(prob_arr[1]) if len(prob_arr) > 1 else float(prob_arr[0])
        else:
            prob = float(_pahaw_model.predict(feature_vec)[0])

        pred = "Parkinson" if prob >= 0.5 else "Healthy"
        return {
            "prediction": pred,
            "probability": prob,
            "features_extracted": len(feature_list),
            "features": features,
            "is_mock": False,
        }
    except Exception as exc:
        logger.error("PaHaW manual inference error: %s", exc)
        raise
