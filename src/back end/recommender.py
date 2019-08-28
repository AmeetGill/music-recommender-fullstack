import math
import operator
from functools import reduce

import numpy as np
from numpy import linalg as LA
from sklearn.ensemble import RandomForestClassifier

from centroid_distance_getter import get_centroid_distances
from constants import CHOSEN_PARS_CLUSTER, CHOSEN_PARS_RF, LIMIT_LIST
from listening_count_reader import get_listened_songs



def recommend(song_dict, entered_ids, amount, global_clusters):
    '''
    Recommend an amount of songs for specific entered songs. Only songs
    that are in the same cluster as at least one entered song after a
    kmeans++ clustering are taken into account.

    song_dict: Dictionary containing all song information

    entered_ids: the song ids entered by the user

    amount: how many songs to recommend
    '''
    # split the songs into their clusters
    clusters = global_clusters
    # give points to all songs that are in the same cluster as an entered song
    for song_id in entered_ids:
        ids_to_give_points = [
            sid for sid in clusters[song_dict[song_id]['label']]
            if sid not in entered_ids]
        song_dict = distribute_points(
            ids_to_give_points, song_dict, song_id, CHOSEN_PARS_CLUSTER)
    return print_recommendation(song_dict, entered_ids, amount)


def build_song_clusters(song_dict, count):
    '''
    Split the song dictionary into the clusters that are specified within.
    '''
    clusters = {}
    for i in range(0, count):
        cluster = []
        for song in song_dict:
            if song_dict[song]['label'] == i:
                cluster.append(song)
        clusters[i] = cluster
    return clusters


def recommend_w_rf(song_dict, entered_ids, amount):
    '''
    Recommend an amount of songs for specific entered songs. Only songs
    that a Random Forest predicts as 'good' are taken into account.

    song_dict: Dictionary containing all song information

    entered_ids: the song ids entered by the user

    amount: how many songs to recommend
    '''
    # lists for building the Random Forest
    rf_pars = []
    rf_targets = []
    rf_ids = []  # tracks the songs that are already included
    rf_targets_quant = []  # tracks how often each song is already included
    # all users and the songs they've listened to
    listened_songs = get_listened_songs(limits=LIMIT_LIST)[0]
    for user in listened_songs.keys():
        # only users are taken into account to build the random forest that
        # have at least one of the entered songs in their 'good' category
        contains_good_song = False
        for song_id in entered_ids:
            contains_good_song = song_id in listened_songs[user]['good']
        if contains_good_song:
            for like, like_value in zip(['bad', 'medium', 'good'], [1, 2, 3]):
                for song_id in listened_songs[user][like]:
                    if song_id not in rf_ids:
                        rf_ids.append(song_id)
                        rf_pars.append([song_dict[song_id][par]
                                        for par in CHOSEN_PARS_RF])
                        rf_targets_quant.append(1)
                        rf_targets.append(like_value)
                    # if a value already exists for that song, take the
                    # average of all values
                    else:
                        index = rf_ids.index(song_id)
                        rf_targets_quant[index] += 1
                        rf_targets[index] = (rf_targets[index] + like_value) \
                            / rf_targets_quant[index]
    # convert integers back to bad, medium, and good category strings
    for index in range(0, len(rf_targets)):
        if int(rf_targets[index]) == 1:
            rf_targets[index] = 'bad'
        elif int(rf_targets[index]) == 2:
            rf_targets[index] = 'medium'
        else:
            rf_targets[index] = 'good'
    # build the Random Forest
    rf = RandomForestClassifier()
    rf.fit(rf_pars, rf_targets)
    # predict bad, medium, or good category for each song in the data
    ids = []
    songs_to_predict = []
    for song_id in song_dict:
        songs_to_predict.append([song_dict[song_id][par]
                                 for par in CHOSEN_PARS_RF])
        ids.append(song_id)
    predictions = rf.predict(songs_to_predict)
    # points are given only to songs that are predicted in the good category
    good_indices = []  # get the indices of the good songs
    for i in range(0, len(predictions)):
        if predictions[i] == 'good':
            good_indices.append(i)
    ids_to_give_points = [ids[index] for index in good_indices
                          if ids[index] not in entered_ids]
    # for each entered song, distribute points to all good songs
    for song_id in entered_ids:
        song_dict = distribute_points(ids_to_give_points, song_dict, song_id,
                                      CHOSEN_PARS_RF)
    return print_recommendation(song_dict, entered_ids, amount)


def distribute_points(ids_to_give_points, song_dict, entered_id, parameters,
                      min_points=8, max_points=10):
    '''
    Distributes points to songs depending on its similarity to an
    entered song.

    ids_to_give_points: List of song ids to give points to

    song_dict: Dictionary containing the songs

    entered_id: The entered song that each song is compared to

    min_points: the minimum of points to give. Default 8

    max_points: the maximum of points to give. Default 10
    '''
    # if there are no songs to give points to, return the dictionary as is
    if not ids_to_give_points:
        return song_dict
    max_distance = float('-inf')
    min_distance = float('inf')
    # for each song calculate the euclidean distance to the entered song
    for song_id in ids_to_give_points:
        par_distances = [song_dict[entered_id][key] -
                         song_dict[song_id][key] for key in parameters]
        distance = LA.norm(par_distances, 2)  # euclidean distance
        song_dict[song_id]['distance'] = distance
        max_distance = max(max_distance, distance)
        min_distance = min(min_distance, distance)
    # give points to each song depending on its distance
    for song_id in ids_to_give_points:
        if(max_distance == min_distance):
            points = max_points
        else:
            diff = max_distance - song_dict[song_id]['distance']
            points = diff / (max_distance - min_distance) * \
                (max_points - min_points) + min_points
        song_dict[song_id]['points'] = max(
            song_dict[song_id]['points'], points)
    return song_dict


def print_recommendation(song_dict, entered_ids, amount):
    ''' Print a recommendation and return it as a string. '''
    point_dict = build_point_dict(song_dict)
    to_send_dict = {}
    to_send_dict['entered_songs'] = []
    to_send_dict['recommended_songs'] = []


    # print the songs the user has entered
    print('You entered the following songs ...')
    ret_string = 'You entered the following songs ...<br/><br/>'
    for entered_id in entered_ids:
      #  s = song_dict[entered_id]['title'] + \
      #      ' by ' + song_dict[entered_id]['artist']
        detail = {}
        detail['title'] = song_dict[entered_id]['title']
        detail['artist'] = song_dict[entered_id]['artist']
        to_send_dict['entered_songs'].append(detail)
 #       print(s)
      #  ret_string += s + '<br/>'
    #ret_string += '<br/><br/>'
    # print the recommendations
    print('\nThese are the best', str(amount), 'songs you might also like:')
    ret_string += 'These are the best ' + \
        str(amount) + ' songs you might also like:<br/><br/>'
    for i in range(0, amount):
        # get the song with the most points from the dictionary
        best_song = max(point_dict.items(), key=operator.itemgetter(1))[0]
     #   s = song_dict[best_song]['title'] + ' by ' + \
     #       song_dict[best_song]['artist'] + ' (' + str(
     #       point_dict[best_song]) + ' points)'
        detail = {}
        detail['title'] = song_dict[best_song]['title']
        detail['artist'] = song_dict[best_song]['artist']
        detail['points'] = point_dict[best_song]
        detail['id'] = best_song
        to_send_dict['recommended_songs'].append(detail)
#        print(s)
    #    ret_string += s + '<br/>'
        # remove the song from the dictionary
        point_dict.pop(best_song)

    print('here we go')
    print(to_send_dict)
    return to_send_dict
 #   return ret_string, point_dict


def build_point_dict(song_dict):
    '''
    Extracts from the complete song dictionary another dictionary that
    only contains the songs and their points for easier access.
    '''
    point_dict = {}
    for song in song_dict:
        if song_dict[song]['points'] != 0:
            point_dict[song] = song_dict[song]['points']


    return point_dict

