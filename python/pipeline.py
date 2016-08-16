from pyspark import SparkContext, SparkConf
from parameter_grid import generate_parameters

if __name__ == '__main__':
    conf = SparkConf().setAppName('Pipeline').setMaster('local')
    sc = SparkContext('local[*]', conf=conf)
