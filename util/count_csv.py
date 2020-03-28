import csv
import regex as re
from os import path

def write_csv(file, lines):
	with open(file, 'w') as f:
		for line in lines:
			f.write(line + '\n')

def print_sorted(x):
	print({k: v for k, v in sorted(x.items(), key=lambda item: item[1])})

def count_things(file):
	csv_lines = []
	header = ''
	genre_count = {}
	on_count = {}
	tag_count = {}
	with open(file, 'r') as f:
		reader = csv.reader(f)
		for row in reader:
			if header == '':
				header = row
				continue

			# print(row[0])

			# count genres
			i = header.index('genres')
			genres = row[i].split(",")
			genres = [genre.strip() for genre in genres]
			for genre in genres:
				if genre not in genre_count:
					genre_count[genre] = 1
				else:
					genre_count[genre] += 1

			# count networks
			i = header.index('original_network')
			networks = row[i].split(",")
			networks = [n.strip() for n in networks]
			for on in networks:
				if on not in on_count:
					on_count[on] = 1
				else:
					on_count[on] += 1

			# count tags
			i = header.index('mdl_tags')
			tags = row[i].split(",")
			tags = [tag.strip() for tag in tags]
			for tag in tags:
				if tag not in tag_count:
					tag_count[tag] = 1
				else:
					tag_count[tag] += 1

	print_sorted(genre_count)
	print_sorted(on_count)
	# print_sorted(tag_count)
	return 0

if __name__ == "__main__":
	count_things('data/mdl_douban_data_100_min_img.csv')
