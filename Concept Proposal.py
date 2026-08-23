import pandas as pd
import io

# The raw data we compiled
raw_csv_data = """Day,Time Slot,MPO303,MPO304,MPO305,MPO306,MPO307,MPO308 (Gaming),MPO308 (SHS),MPO316,MPO317,MPO318,MPO311,MPO319,MPO320,MPO321,MPO322,MPO323,MPO324,MPO407,MPO408
Monday,07:30 AM,Occupied,Occupied,Available,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Occupied,Available,Available,Occupied,Occupied
Monday,09:00 AM,Occupied,Occupied,Available,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied
Monday,10:30 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available
Monday,12:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied
Monday,01:30 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Available,Occupied,Available,Occupied,Occupied,Occupied
Monday,03:00 PM,Occupied,Occupied,Occupied,Available,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Available,Occupied,Available,Occupied,Occupied,Available
Monday,04:30 PM,Available,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Available,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied
Monday,06:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Available,Occupied
Monday,07:30 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Occupied,Available,Available,Occupied
Tuesday,07:30 AM,Available,Occupied,Available,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available
Tuesday,09:00 AM,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied
Tuesday,10:30 AM,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied
Tuesday,12:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied
Tuesday,01:30 PM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available
Tuesday,03:00 PM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied
Tuesday,04:30 PM,Available,Occupied,Available,Available,Occupied,Available,Available,Occupied,Available,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Available,Available,Occupied
Tuesday,06:00 PM,Available,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Occupied,Available,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Available,Available
Tuesday,07:30 PM,Available,Occupied,Available,Occupied,Available,Available,Available,Occupied,Available,Occupied,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Available
Wednesday,07:30 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied
Wednesday,09:00 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied
Wednesday,10:30 AM,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied
Wednesday,12:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied
Wednesday,01:30 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Available,Occupied,Occupied
Wednesday,03:00 PM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied
Wednesday,04:30 PM,Available,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Available,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Occupied
Wednesday,06:00 PM,Available,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Available,Available
Wednesday,07:30 PM,Available,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Occupied,Available,Available,Available
Thursday,07:30 AM,Available,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Available,Occupied,Available,Occupied,Available,Occupied,Occupied,Available,Available,Available
Thursday,09:00 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Available,Available,Available
Thursday,10:30 AM,Occupied,Available,Available,Available,Occupied,Available,Occupied,Available,Occupied,Available,Occupied,Occupied,Available,Available,Occupied,Occupied,Available,Available,Occupied
Thursday,12:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Available
Thursday,01:30 PM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied
Thursday,03:00 PM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Occupied,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Available,Occupied
Thursday,04:30 PM,Available,Occupied,Available,Occupied,Occupied,Available,Available,Occupied,Available,Available,Occupied,Occupied,Available,Available,Occupied,Occupied,Occupied,Available,Occupied
Thursday,06:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Occupied,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Occupied,Available,Available
Thursday,07:30 PM,Occupied,Occupied,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Available,Available,Available
Friday,07:30 AM,Occupied,Occupied,Available,Occupied,Occupied,Available,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Occupied,Occupied,Occupied,Available,Available
Friday,09:00 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Available,Occupied,Occupied,Available,Available,Occupied,Occupied,Available,Available,Available
Friday,10:30 AM,Occupied,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Occupied,Occupied,Available,Available,Occupied
Friday,12:00 PM,Occupied,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Available,Occupied,Available,Available,Available,Occupied,Occupied,Available,Available,Available
Friday,01:30 PM,Occupied,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Occupied,Available,Available,Available,Occupied
Friday,03:00 PM,Occupied,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Available,Available,Occupied,Available,Available,Occupied,Available,Occupied,Available,Occupied
Friday,04:30 PM,Occupied,Occupied,Occupied,Available,Occupied,Available,Available,Available,Available,Available,Occupied,Occupied,Available,Occupied,Available,Occupied,Available,Available,Occupied
Friday,06:00 PM,Available,Occupied,Available,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Available,Occupied
Friday,07:30 PM,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Available,Occupied
Saturday,07:30 AM,Available,Occupied,Occupied,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Available,Available,Available,Available,Occupied,Available,Available,Occupied
Saturday,09:00 AM,Available,Occupied,Occupied,Occupied,Available,Occupied,Available,Available,Available,Occupied,Occupied,Available,Available,Available,Occupied,Occupied,Available,Available,Occupied
Saturday,10:30 AM,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Available,Available,Occupied
Saturday,12:00 PM,Available,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Occupied
Saturday,01:30 PM,Available,Occupied,Occupied,Occupied,Occupied,Occupied,Occupied,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Occupied
Saturday,03:00 PM,Occupied,Occupied,Occupied,Occupied,Available,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Occupied,Available,Occupied
Saturday,04:30 PM,Occupied,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Available,Available,Available
Saturday,06:00 PM,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Occupied,Available,Available,Available
Saturday,07:30 PM,Available,Occupied,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Available,Available,Available,Available
Sunday,07:30 AM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Available,Available,Available,Available
Sunday,09:00 AM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Occupied,Available,Available,Available,Available
Sunday,10:30 AM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,12:00 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,01:30 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,03:00 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,04:30 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,06:00 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available
Sunday,07:30 PM,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available,Available"""

# Read the text into a pandas DataFrame
df = pd.read_csv(io.StringIO(raw_csv_data))

# This line is the critical part: it writes directly to your hard drive
df.to_csv('compiled_schedule.csv', index=False)

print("Success! compiled_schedule.csv has been created in this directory.")