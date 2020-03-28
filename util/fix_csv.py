import csv
import regex as re
from os import path

def wrap_and_join(item_list):
	# wrap each item in quotes
	item_list = [('\"' + str(item) + '\"') for item in item_list]
	# join with comma
	line = ','.join(item_list)
	return line

def write_csv(file, lines):
	with open(file, 'w') as f:
		for line in lines:
			f.write(line + '\n')

def split_and_strip(line):
	line = line.split(",")
	# remove extra text from tags
	if "Vote or add tags" in line[-1]:
		line[-1] = line[-1].split("(")[0]
	line = [item.strip() for item in line]
	line = list(set(line)) # remove duplicates
	line = ",".join(line)
	return line

def duration_to_mins(duration):
	mins = 0
	units = duration.split('.')
	for unit in units:
		unit = unit.strip()
		if 'hr' in unit:
			val = int(unit.split(' ')[0])
			mins += val * 60
		elif 'min' in unit:
			val = int(unit.split(' ')[0])
			mins += val
	return mins

# remove unused columns
def minify_csv(file):
	# TODO
	return

def add_images(file):
	csv_lines = []
	header = ''
	with open(file, 'r') as f:
		reader = csv.reader(f)
		for row in reader:
			if header == '':
				header = row
				continue

			# get image name
			i = header.index('name')
			filename = row[i]
			filename = filename.lower()
			filename = re.sub("\p{P}(?<!-)", "", filename)
			filename = filename.replace(' ', '-')
			if filename == 'mother':
				i = header.index('air_dates')
				if '2018' in row[i]:
					filename = 'mother-2018'
				else:
					filename = 'mother-2010'
			filename += '.jpg'

			# check that image file exists
			if not path.isfile('../img/' + filename):
				print(filename)
			else:
				row.append(filename)

			# convert to list
			r = wrap_and_join(row)
			csv_lines.append(r)

		header.append('image_path')
		h = wrap_and_join(header)
		csv_lines.insert(0, h)

		if (len(header) != len(row)):
			print("error, lengths do not match")
		else:
			write_csv('data/mdl_douban_data_100_min_img.csv', csv_lines)
	
	return csv_lines


def fix_csv(file):
	csv_lines = []
	header = ''
	with open(file, 'r') as f:
		reader = csv.reader(f)
		for row in reader:
			if header == '':
				header = row
				continue

			# print(row[0])

			# strip whitespace from other_names
			i = header.index('other_names')
			row[i] = split_and_strip(row[i])

			# stripe whitespace from genres
			i = header.index('genres')
			row[i] = split_and_strip(row[i])

			# strip whitespace from original_network
			i = header.index('original_network')
			row[i] = split_and_strip(row[i])

			# strip whitespace from tags
			i = header.index('mdl_tags')
			row[i] = split_and_strip(row[i])

			# strip whitespace from air_days
			i = header.index('air_days')
			row[i] = split_and_strip(row[i])

			# strip comma from num_watchers
			i = header.index('mdl_num_watchers')
			row[i] = str(int(row[i].replace(',', '')))

			# remove pound sign and commas from popularity
			i = header.index('mdl_popularity')
			pop = row[i].strip('#')
			row[i] = str(int(pop.replace(',', ''))) 

			# remove pound sign and commas from rank
			i = header.index('mdl_rank')
			rank = row[i].strip('#')
			row[i] = str(int(rank.replace(',', ''))) 

			# convert duration to int
			i = header.index('duration')
			row[i] = duration_to_mins(str(row[i]))

			# parse score text
			i = header.index('mdl_score_text')
			score_text = row[i]
			score_text = score_text.split(" ")
			if len(score_text) == 5:
				rating = score_text[0]
				if rating == 'N/A':
					rating = 0
				num_ratings = str(int(score_text[3].replace(',', '')))
			else:
				rating = 0
				num_ratings = 0
			
			# write rating and num_ratings
			row[i] = rating
			row.insert(i+1, num_ratings)

			# convert to list
			r = wrap_and_join(row)
			csv_lines.append(r)
		
		# change header
		header[header.index('duration')] = "duration_mins"
		header[header.index('mdl_score_text')] = "mdl_rating"
		header.insert(i+1, "mdl_num_ratings")
		h = wrap_and_join(header)
		csv_lines.insert(0, h)

		
		if (len(header) != len(row)):
			print("error, lengths do not match")
		else:
			write_csv('data/mdl_douban_data_100_min_fix.csv', csv_lines)
	
	return csv_lines

if __name__ == "__main__":
	# csv_lines = fix_csv('data/mdl_douban_data_100_min_raw.csv')
	csv_lines = add_images('data/mdl_douban_data_100_min_fix.csv')
