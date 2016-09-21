import sys
import os

import numpy as np
from sklearn.externals import joblib

from scale import scale

SCRIPT_PATH = os.path.dirname(os.path.abspath(__file__))

all_features = np.array(sys.argv[-1].split(','), dtype=int)

x = np.array(scale(all_features)).reshape(1, -1)

scaler = joblib.load(SCRIPT_PATH + '/serialized/scaler.pkl')
clf = joblib.load(SCRIPT_PATH + '/serialized/classifier.pkl')

x = scaler.transform(x)

print(clf.predict(x)[0])
