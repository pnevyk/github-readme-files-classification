# manual features scaling and dimensionality reduction (merge of related features)

import pandas as pd
import numpy as np
import math
import os

SCRIPT_PATH = os.path.dirname(os.path.abspath(__file__))

# make logarithm function "working" with zero values
def logz(x):
    if x != 0:
        return math.log(x)
    else:
        return 0

def scale_cbs(count, length):
    if count != 0:
        return float(length) / count
    else:
        return 0

def scale_usage(text_len, code_len, code_count, link):
    code_ratio = 0
    if code_count != 0:
        code_ratio = float(code_len) / code_count

    # compute average of text length and code ratio,
    # we assume that more code == better usage section (hence bigger weigth)
    # but it can be wrong interference
    text_code_ratio = np.average([text_len, code_ratio], weights=[0.25, 0.75])

    # we want to make better score when there is a link
    # but non-zero score when there is no link
    link_coeff = math.exp(link)

    # strenghen score by link presence coefficient
    score = text_code_ratio * link_coeff

    # we want to distinguish "no usage at all" and "at least link presence" cases,
    # maybe special constant should be used in case of link presence
    if score == 0:
        if link_coeff == 1:
            return 0
        else:
            return link_coeff
    else:
        return score

def scale_docs(text_len, code_len, link):
    # compute average of text length and code ratio,
    # we assume that more code == better docs section (hence bigger weigth)
    # but it can be wrong interference
    text_code_ratio = np.average([text_len, code_len], weights=[1, 2])

    # we want to make better score when there is a link
    # but non-zero score when there is no link
    link_coeff = math.exp(link)

    # strenghen score by link presence coefficient
    score = text_code_ratio * link_coeff

    # we want to distinguish "no docs at all" and "at least link presence" cases,
    # maybe special constant should be used in case of link presence
    if score == 0:
        if link_coeff == 1:
            return 0
        else:
            return link_coeff
    else:
        return score

def scale_install(total_length, link):
    # we want to make better score when there is a link
    # but non-zero score when there is no link
    link_coeff = math.exp(link)

    # strenghen score by link presence coefficient
    score = total_length * link_coeff

    # we want to distinguish "no installation at all" and "at least link presence" cases,
    # maybe special constant should be used in case of link presence
    if score == 0:
        if link_coeff == 1:
            return 0
        else:
            return link_coeff
    else:
        return score

def scale(all_features):
    output = []

    # make document length a logarithm of original value
    output.append(logz(all_features[0]))

    # copy number of sections
    output.append(all_features[1])

    # get average code block length
    output.append(scale_cbs(all_features[2], all_features[3]))

    # copy number of links
    output.append(all_features[4])

    # copy number of images
    output.append(all_features[5])

    # scale usage/examples section
    output.append(scale_usage(all_features[6], all_features[7], all_features[8], all_features[9]))

    #scale getting started/documentation/api
    output.append(scale_docs(all_features[10], all_features[11], all_features[12]))

    # scale installation/download
    output.append(scale_install(all_features[13], all_features[14]))

    # copy support/community/resources links
    output.append(all_features[15])

    # count badges
    output.append(all_features[16] + all_features[17] + all_features[18] + all_features[19])

    # copy deprecation status
    output.append(all_features[20])

    # count important sections
    output.append(all_features[21] + all_features[22] + all_features[23] + all_features[24])

    statistics = pd.read_csv(SCRIPT_PATH + '/../data/statistics.csv')

    for idx, value in enumerate(output):
        output[idx] = value / statistics.values[-1][idx]

    return output
