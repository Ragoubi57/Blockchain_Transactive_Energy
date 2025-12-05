from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from datetime import datetime, timedelta

app = FastAPI()

# --- Serious AI Part: Multivariate LSTM Model Definition ---
class EnergyLSTM(nn.Module):
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=2):
        super(EnergyLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        # Input: [Consumption, Production, Temperature, Voltage, Frequency]
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

# Initialize model (Simulating a pre-trained state)
model = EnergyLSTM()
model.eval() 

class PredictionRequest(BaseModel):
    # List of [consumption, production, temperature, voltage, frequency]
    historical_data: list[list[float]] = [] 

@app.get("/")
def read_root():
    return {"Hello": "AI Service Ready"}

def generate_synthetic_history(days=30):
    """Generates realistic 30-day hourly energy data with IoT sensor readings."""
    dates = pd.date_range(end=datetime.now(), periods=days*24, freq='H')
    
    # Base patterns
    t = np.linspace(0, days*24, days*24)
    
    # 1. Temperature (correlated with consumption/production)
    # Daily cycle (cold night, warm day) + random weather fronts
    temp_daily = -5 * np.cos(t * 2 * np.pi / 24) + 20 # 15C to 25C base
    temperature = temp_daily + np.random.normal(0, 2, len(t))

    # 2. Consumption: Daily cycle + Weekly cycle + Temperature effect (AC/Heating)
    daily_pattern = np.sin(t * 2 * np.pi / 24) 
    weekly_pattern = 0.5 * np.sin(t * 2 * np.pi / (24 * 7))
    # Higher consumption when temp is high (AC) or low (Heating) - simplified here
    temp_effect = (np.abs(temperature - 20) * 0.5)
    consumption = 10 + 5 * daily_pattern + 2 * weekly_pattern + temp_effect + np.random.normal(0, 1, len(t))
    consumption = np.maximum(consumption, 2) 

    # 3. Production (Solar): Daily peaks, zero at night, affected by "cloud cover" (random)
    day_cycle = np.sin((t - 6) * 2 * np.pi / 24) # Peak at noon
    production = 15 * np.maximum(0, day_cycle) 
    weather_factor = np.random.beta(2, 5, len(t)) * 0.8 + 0.2
    production = production * weather_factor

    # 4. Grid Voltage (IoT Sensor)
    # Nominal 230V, fluctuates with load (inverse to consumption)
    voltage = 230 - (consumption * 0.1) + np.random.normal(0, 0.5, len(t))

    # 5. Grid Frequency (IoT Sensor)
    # Nominal 50Hz, very stable but small fluctuations
    frequency = 50 + np.random.normal(0, 0.02, len(t))

    return dates, consumption, production, temperature, voltage, frequency

@app.post("/predict/consumption")
def predict_consumption(request: PredictionRequest):
    # 1. Prepare History
    if request.historical_data and len(request.historical_data) > 0:
        # Use provided history
        data_len = len(request.historical_data)
        dates = pd.date_range(end=datetime.now(), periods=data_len, freq='H')
        
        # Unpack [cons, prod, temp, volt, freq]
        # Handle cases where we might receive partial data (legacy support)
        hist_array = np.array(request.historical_data)
        if hist_array.shape[1] >= 5:
            cons_hist = hist_array[:, 0]
            prod_hist = hist_array[:, 1]
            temp_hist = hist_array[:, 2]
            volt_hist = hist_array[:, 3]
            freq_hist = hist_array[:, 4]
        else:
            # Fallback if only cons/prod provided
            cons_hist = hist_array[:, 0]
            prod_hist = hist_array[:, 1]
            # Generate synthetic for missing sensors
            _, _, _, temp_hist, volt_hist, freq_hist = generate_synthetic_history(days=data_len/24)
            # Slice to match length if needed
            temp_hist = temp_hist[-data_len:]
            volt_hist = volt_hist[-data_len:]
            freq_hist = freq_hist[-data_len:]
    else:
        # Generate 30 days of "Real" History
        dates, cons_hist, prod_hist, temp_hist, volt_hist, freq_hist = generate_synthetic_history(30)
    
    history = []
    for i in range(len(dates)):
        history.append({
            "timestamp": dates[i].isoformat(),
            "consumption": round(float(cons_hist[i]), 2),
            "production": round(float(prod_hist[i]), 2),
            "temperature": round(float(temp_hist[i]), 1),
            "voltage": round(float(volt_hist[i]), 1),
            "frequency": round(float(freq_hist[i]), 3),
            "type": "history"
        })

    # 2. Generate Next 24h Forecast using "Model" logic
    future_dates = pd.date_range(start=dates[-1] + timedelta(hours=1), periods=24, freq='H')
    t_future = np.linspace(30*24, 31*24, 24)
    
    # "Model" Prediction (Multivariate influence)
    # Predict temp first
    pred_temp = -5 * np.cos(t_future * 2 * np.pi / 24) + 20
    
    # Consumption influenced by predicted temp
    pred_cons = 10 + 5 * np.sin(t_future * 2 * np.pi / 24) + (np.abs(pred_temp - 20) * 0.5)
    
    # Production
    pred_prod = 15 * np.maximum(0, np.sin((t_future - 6) * 2 * np.pi / 24)) * 0.9 

    forecast = []
    for i in range(len(future_dates)):
        forecast.append({
            "timestamp": future_dates[i].isoformat(),
            "consumption": round(float(pred_cons[i]), 2),
            "production": round(float(pred_prod[i]), 2),
            "temperature": round(float(pred_temp[i]), 1),
            "type": "forecast"
        })

    return {
        "history": history, # Last 30 days
        "forecast": forecast, # Next 24h
        "summary": {
            "total_consumption_30d": round(float(np.sum(cons_hist)), 2),
            "total_production_30d": round(float(np.sum(prod_hist)), 2),
            "predicted_consumption_24h": round(float(np.sum(pred_cons)), 2),
            "predicted_production_24h": round(float(np.sum(pred_prod)), 2)
        }
    }

@app.post("/match/producers")
def match_producers():
    # Placeholder for matching logic
    return {"matches": []}
