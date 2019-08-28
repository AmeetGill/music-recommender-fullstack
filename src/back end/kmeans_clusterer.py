import itertools
import json
import random

import numpy as np
from sklearn import metrics
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

from constants import CP, MSD_DATA_LABELED_FILE_PATH, PARS
from listening_count_reader import get_random_test_listeners
from recommender import test_recommend
from song_dict_reader import read_song_dict_w_labels


#def add_kmeans_labels():
'''
Reads the song data file without clustering labels, then calls kmeans++
clustering and saves the data including the clustering label results in
another file.
For clustering, 200 centroids and the parameters timeSig, songkey and mode
are chosen because that combination had the best testing results.
'''
song_dict = read_song_dict_w_labels()
keys = []
#cluster_list = []
for key in song_dict:
    keys.append(key)
#    cluster_list.append([song_dict[key][par] for par in CP])
#labels = do_kmeans(cluster_list, 200)[0]
# save the labels and the new file '''
number_of_songs = []

index = np.arange(200)

for i in range(0,200):
    number_of_songs.append(0)

for index in range(0, len(keys)):
    #song_dict[keys[index]]['label'] = np.asscalar(labels[index])
    number_of_songs[song_dict[keys[index]]['label']] += 1;

    

#print(number_of_songs)

plt.bar(range(0,50), number_of_songs[0:50])
plt.show()
# with open(MSD_DATA_LABELED_FILE_PATH, 'w') as outfile:
#     json.dump(song_dict, outfile)


def do_kmeans(par_list, cluster_cnt):
    '''
    Executes a kmeans++ clustering with a specified amount of
    centroids and returns the labels as well as the cluster centroids.

    par_list: list containing the tupels to cluster

    cluster_cnt: the amount of clusters to be made
    '''
    kmeans = KMeans(n_clusters=cluster_cnt, init='k-means++')
    kmeans.fit(par_list)
    return kmeans.labels_, kmeans.cluster_centers_


