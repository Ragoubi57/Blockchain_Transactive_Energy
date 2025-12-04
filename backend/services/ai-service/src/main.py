from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from datetime import datetime, timedelta

app = FastAPI()

# --- Serious AI Part: LSTM Model Definition ---
class EnergyLSTM(nn.Module):
    def __init__(self, input_size=2, hidden_size=50, num_layers=2, output_size=2):
        super(EnergyLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
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
    historical_data: list[float] = [] # Optional now as we generate synthetic history

@app.get("/")
def read_root():
    return {"Hello": "AI Service Ready"}

def generate_synthetic_history(days=30):
    """Generates realistic 30-day hourly energy data."""
    dates = pd.date_range(end=datetime.now(), periods=days*24, freq='H')
    
    # Base patterns
    t = np.linspace(0, days*24, days*24)
    
    # Consumption: Daily cycle + Weekly cycle + Random noise
    daily_pattern = np.sin(t * 2 * np.pi / 24) 
    weekly_pattern = 0.5 * np.sin(t * 2 * np.pi / (24 * 7))
    consumption = 10 + 5 * daily_pattern + 2 * weekly_pattern + np.random.normal(0, 1, len(t))
    consumption = np.maximum(consumption, 2) # Ensure non-negative

    # Production (Solar): Daily peaks, zero at night
    day_cycle = np.sin((t - 6) * 2 * np.pi / 24) # Peak at noon
    production = 15 * np.maximum(0, day_cycle) 
    # Add weather effects (random cloud cover)
    weather_factor = np.random.beta(2, 5, len(t)) * 0.8 + 0.2
    production = production * weather_factor

    return dates, consumption, production

@app.post("/predict/consumption")
def predict_consumption(request: PredictionRequest):
    # 1. Generate 30 days of "Real" History
    dates, cons_hist, prod_hist = generate_synthetic_history(30)
    
    history = []
    for d, c, p in zip(dates, cons_hist, prod_hist):
        history.append({
            "timestamp": d.isoformat(),
            "consumption": round(float(c), 2),
            "production": round(float(p), 2),
            "type": "history"
        })

    # 2. Generate Next 24h Forecast using "Model" logic
    # In a real production system, we would tensor-ize the history and pass it to model(input)
    # Here we simulate the model's output by continuing the pattern
    
    future_dates = pd.date_range(start=dates[-1] + timedelta(hours=1), periods=24, freq='H')
    t_future = np.linspace(30*24, 31*24, 24)
    
    # "Model" Prediction (slightly smoothed version of reality)
    pred_cons = 10 + 5 * np.sin(t_future * 2 * np.pi / 24) + 2 * (0.5 * np.sin(t_future * 2 * np.pi / (24 * 7)))
    pred_prod = 15 * np.maximum(0, np.sin((t_future - 6) * 2 * np.pi / 24)) * 0.9 # Assume sunny day forecast

    forecast = []
    for d, c, p in zip(future_dates, pred_cons, pred_prod):
        forecast.append({
            "timestamp": d.isoformat(),
            "consumption": round(float(c), 2),
            "production": round(float(p), 2),
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
