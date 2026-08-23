import streamlit as st
import pandas as pd
import plotly.graph_objects as go

# 1. Setup the Web Page Layout
st.set_page_config(page_title="Room Tracker", layout="wide")
st.title("Interactive 3rd Floor Room Availability")

# 2. Load the Data
@st.cache_data
def load_data():
    return pd.read_csv('compiled_schedule.csv')

df = load_data()
all_rooms = [c for c in df.columns if c not in ['Day', 'Time Slot']]

# 3. Create the Sidebar Filters
st.sidebar.header("🔍 Filters")
st.sidebar.write("Looking for a specific room type? Filter the dashboard below:")

# Multiselect filter allowing you to isolate specific rooms
selected_rooms = st.sidebar.multiselect(
    "Select Rooms to Monitor:", 
    options=all_rooms, 
    default=all_rooms
)

if not selected_rooms:
    st.warning("Please select at least one room from the sidebar to view the heatmap.")
    st.stop()

# 4. Process Data Based on Filters
def get_metrics(row):
    # Find which of the *selected* rooms are available
    available = [r for r in selected_rooms if row[r] == 'Available']
    occupied = [r for r in selected_rooms if row[r] == 'Occupied']
    
    # Calculate rate based only on the filtered rooms
    rate = len(occupied) / len(selected_rooms)
    
    # Format the list of rooms for the hover tooltip with line breaks
    hover_text = "<br>".join(available) if available else "<i>None available</i>"
    return rate, hover_text

metrics = df.apply(get_metrics, axis=1)
df['Occupancy_Rate'] = [m[0] for m in metrics]
df['Available_List'] = [m[1] for m in metrics]

# 5. Prepare Data Grids for Plotly
times_order = [
    '07:30 AM', '09:00 AM', '10:30 AM', '12:00 PM', 
    '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'
]
days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

z_data = []      # The colors (occupancy rates)
hover_data = []  # The text inside the tooltips

for time in times_order:
    z_row = []
    hover_row = []
    for day in days_order:
        cell = df[(df['Day'] == day) & (df['Time Slot'] == time)]
        if not cell.empty:
            z_row.append(cell.iloc[0]['Occupancy_Rate'])
            hover_row.append(cell.iloc[0]['Available_List'])
        else:
            z_row.append(0)
            hover_row.append("No Data")
    z_data.append(z_row)
    hover_data.append(hover_row)

# 6. Build the Interactive Plotly Heatmap
fig = go.Figure(data=go.Heatmap(
    z=z_data,
    x=days_order,
    y=times_order,
    customdata=hover_data, # Inject our custom HTML room lists
    # Define our discrete Tailwind-style color scale
    colorscale=[
        [0.0, '#22c55e'],   # Green 
        [0.3, '#22c55e'], 
        [0.31, '#f97316'],  # Orange
        [0.75, '#f97316'], 
        [0.76, '#ef4444'],  # Red
        [0.99, '#ef4444'], 
        [1.0, '#7f1d1d']    # Super Red
    ],
    # Design the hover tooltip popup
    hovertemplate=(
        "<b>%{x} at %{y}</b><br>"
        "Occupied: %{z:.0%}<br>"
        "<hr>"
        "<b>Available Rooms:</b><br>%{customdata}"
        "<extra></extra>" # Removes the messy secondary trace label
    )
))

# Force the Y-axis to read top-to-bottom (morning to evening)
fig.update_layout(
    height=700, 
    yaxis_autorange='reversed',
    margin=dict(l=20, r=20, t=40, b=20)
)

# 7. Render the chart in the Streamlit app
st.plotly_chart(fig, use_container_width=True)