import sys
import os

import numpy as np
import pandas as pd
from sklearn.externals import joblib

from scale import scale

def argmax(array, n):
    maxes = sorted(enumerate(array), key=lambda kv: kv[1], reverse=True)
    return list(map(lambda kv: kv[0], maxes[:n]))

RATING_MAP = {
    1: 'BAD',
    2: 'POOR',
    3: 'AVERAGE',
    4: 'GOOD',
    5: 'GREAT'
}

ADVICE_MAP = np.array([
    'is quite short. Try to extend it.',
    'has just few sections. Maybe adding some more will help.',
    'lacks code blocks. Examples are very good way how to express an idea.',
    'does not contain many links. Try to add some.',
    'lacks images. Visual representation can be better than a lot of text.',
    'has short or no usage/examples section. This section is really important.',
    'has short or no documentation section. Documentation is almost more important than code itself.',
    'does not tell a user how to install your package. It\'s quite an obstacle, isn\'t it?',
    'lacks some support links such as additional resources or community links. Some guiding can help a user to use your package.',
    'lacks informative badges (you know, for example from build status services). They can tell something about your package and users appreciate that.',
    'xxx',
    'does not contain all additional important sections. They are "license", "authors" and "troubleshooting".'
])

SCRIPT_PATH = os.path.dirname(os.path.abspath(__file__))

all_features = np.array(sys.argv[-1].split(','), dtype=int)

x = np.array(scale(all_features)).reshape(1, -1)

scaler = joblib.load(SCRIPT_PATH + '/serialized/scaler.pkl')
clf = joblib.load(SCRIPT_PATH + '/serialized/classifier.pkl')

statistics = pd.read_csv(SCRIPT_PATH + '/../data/statistics-normalized.csv')

diffs = list()
for idx, value in enumerate(x[0]):
    diffs.append(statistics.values[1][idx] - value)

diffs[10] = -1 # don't deal with deprecation status
advice_idx = argmax(diffs, 3)

x = scaler.transform(x)

print('Estimated rating is {}.'.format(RATING_MAP[clf.predict(x)[0]]))
print('Your readme...\n    * ' + '\n    * '.join(ADVICE_MAP[advice_idx]))
