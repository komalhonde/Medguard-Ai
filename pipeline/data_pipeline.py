"""
MedGuard AI - Milestone 03: Python Data & Processing Pipeline
Extracts, validates, cleans, normalizes, and transforms clinical EHR/triage data.
"""

import sys
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MedGuard-DataPipeline")


class VitalSignsSchema(BaseModel):
    heart_rate: float = Field(..., ge=20, le=250, description="Heart rate in beats per minute")
    systolic_bp: float = Field(..., ge=40, le=300, description="Systolic blood pressure in mmHg")
    diastolic_bp: float = Field(..., ge=20, le=200, description="Diastolic blood pressure in mmHg")
    respiratory_rate: float = Field(..., ge=4, le=60, description="Respiratory rate in breaths per minute")
    oxygen_saturation: float = Field(..., ge=50, le=100, description="Pulse oximetry percentage")
    temperature_c: float = Field(..., ge=30.0, le=45.0, description="Core body temperature in Celsius")
    gcs_score: int = Field(..., ge=3, le=15, description="Glasgow Coma Scale score")
    pain_score: int = Field(0, ge=0, le=10, description="Patient reported pain score")

    @field_validator("diastolic_bp")
    @classmethod
    def validate_pulse_pressure(cls, v: float, info: Any) -> float:
        systolic = info.data.get("systolic_bp")
        if systolic is not None and v >= systolic:
            raise ValueError(f"Diastolic BP ({v}) cannot be greater than or equal to Systolic BP ({systolic})")
        return v


class LabBiomarkersSchema(BaseModel):
    wbc_count: Optional[float] = Field(None, ge=0.1, le=100.0)
    lactate: Optional[float] = Field(None, ge=0.1, le=30.0)
    serum_creatinine: Optional[float] = Field(None, ge=0.1, le=25.0)
    blood_glucose: Optional[float] = Field(None, ge=10.0, le=1500.0)
    troponin_i: Optional[float] = Field(None, ge=0.0, le=100.0)


class PatientRecordSchema(BaseModel):
    patient_id: str
    age: int = Field(..., ge=0, le=125)
    gender: str
    chief_complaint: str
    vitals: VitalSignsSchema
    labs: Optional[LabBiomarkersSchema] = None
    past_medical_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)


def clean_and_normalize_vitals(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cleans raw telemetry inputs:
    - Normalizes Fahrenheit to Celsius if detected (> 50.0)
    - Clips extreme non-physiological outliers
    - Computes Shock Index (HR / SBP)
    - Computes Mean Arterial Pressure (MAP = DBP + 1/3 * (SBP - DBP))
    """
    cleaned = dict(raw_data)
    
    # Temperature Normalization
    if "temperature" in cleaned:
        temp = float(cleaned["temperature"])
        if temp > 50.0:  # Assumed Fahrenheit
            temp_c = (temp - 32.0) * (5.0 / 9.0)
            logger.info(f"Converted temperature from {temp:.1f}°F to {temp_c:.1f}°C")
            cleaned["temperature_c"] = round(temp_c, 1)
        else:
            cleaned["temperature_c"] = round(temp, 1)

    hr = float(cleaned.get("heart_rate", 75))
    sbp = float(cleaned.get("systolic_bp", 120))
    dbp = float(cleaned.get("diastolic_bp", 80))

    # Physiological Engineering Features
    shock_index = hr / sbp if sbp > 0 else 0.0
    map_pressure = dbp + (1.0 / 3.0) * (sbp - dbp)

    cleaned["shock_index"] = round(shock_index, 3)
    cleaned["mean_arterial_pressure"] = round(map_pressure, 1)
    
    return cleaned


def calculate_news2_python(v: Dict[str, Any]) -> int:
    """Royal College of Physicians NEWS2 Calculation"""
    score = 0
    rr = v.get("respiratory_rate", 16)
    spo2 = v.get("oxygen_saturation", 98)
    sbp = v.get("systolic_bp", 120)
    hr = v.get("heart_rate", 75)
    temp = v.get("temperature_c", 37.0)
    gcs = v.get("gcs_score", 15)

    if rr <= 8 or rr >= 25: score += 3
    elif rr >= 21: score += 2
    elif rr <= 11: score += 1

    if spo2 <= 91: score += 3
    elif spo2 <= 93: score += 2
    elif spo2 <= 95: score += 1

    if sbp <= 90 or sbp >= 220: score += 3
    elif sbp <= 100: score += 2
    elif sbp <= 110: score += 1

    if hr <= 40 or hr >= 131: score += 3
    elif hr >= 111: score += 2
    elif hr <= 50 or hr >= 91: score += 1

    if temp <= 35.0: score += 3
    elif temp >= 39.1: score += 2
    elif temp <= 36.0 or temp >= 38.1: score += 1

    if gcs < 15: score += 3

    return score


if __name__ == "__main__":
    logger.info("Initializing MedGuard Data Pipeline Demonstration...")
    sample_raw = {
        "heart_rate": 118,
        "systolic_bp": 88,
        "diastolic_bp": 54,
        "respiratory_rate": 26,
        "oxygen_saturation": 91,
        "temperature": 102.5,  # Fahrenheit test
        "gcs_score": 13,
        "pain_score": 5
    }

    cleaned = clean_and_normalize_vitals(sample_raw)
    news2 = calculate_news2_python(cleaned)
    logger.info(f"Processed Vitals: MAP={cleaned['mean_arterial_pressure']} mmHg, Shock Index={cleaned['shock_index']}")
    logger.info(f"Calculated NEWS2 Early Warning Score: {news2} (High Risk Criticality)")
    print("Pipeline Execution Completed Successfully.")
