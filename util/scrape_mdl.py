from bs4 import BeautifulSoup
import requests
import csv

## CONSTANTS
HEADER = [
	"# of Watchers",
	"Aired",
	"Aired On",
	"Also Known As",
	"Country",
	"Directors",
	"Drama",
	"Duration",
	"Episodes",
	"Favorites",
	"Genres",
	"Native Title",
	"Original Network",
	"Popularity",
	"Ranked",
	"Rating",
	"Ratings",
	"Reviews",
	"Score",
	"Screenwriters",
	"Tags",
	"Type",
	"Watchers"]

## UTILITY FUNCTIONS: read and write data
def write_urls(file, url_list):
	with open(file, 'w') as f:
		for url in url_list:
			f.write(url + '\n')

def read_urls(file):
	url_list = []
	with open(file, 'r') as f:
		for line in f:
			url_list.append(line.strip())
	return url_list

# same as write_urls but separating for clarity :P
def write_csv(file, lines):
	with open(file, 'w') as f:
		for line in lines:
			f.write(line + '\n')

# make sure csv can be read
def read_csv(file):
	csv_lines = []
	with open(file, 'r') as f:
		lines = csv.reader(f)
		for line in lines:
			csv_lines.append(line)
	return csv_lines

## UTILITY FUNCTIONS: text processing misc
# convert dict to list, including empty items for missing data
def dict_to_list(csv_dict):
	csv_list = []
	for h in HEADER:
		if h not in csv_dict.keys():
			csv_list.append('')
		else:
			csv_list.append(csv_dict[h])
	return csv_list

def wrap_and_join(item_list):
	# wrap each item in quotes
	item_list = [('\"' + item + '\"') for item in item_list]
	# join with comma
	line = ','.join(item_list)
	return line

# input: a list of items
# output: formatted key and value
def clean_line(line):
	# skip 'related content' text, since there's no colon
	if 'Related Content' in line:
		return (None, None)
	
	line = [item.strip() for item in line.split(':', 1)]
	if len(line) != 2:
		print('Expected two items after colon split, got ' + str(len(line)))
		return (None, None)
	
	key = line[0]
	value = line[1]
	# remove pound sign
	return (key, value)

## UTILITY FUNCTIONS: get soup
def get_soup_from_url(url):
	r = requests.get(url)
	soup = BeautifulSoup(r.text, features='lxml')
	return soup

def get_soup_from_file(file):
	soup = ''
	with open(file) as f:
		soup = BeautifulSoup(f, features='lxml')
	return soup

# parse a single drama listing
def parse_drama(soup):
	csv_dict = {}

	# get listed details
	lines = soup.find_all('li', class_='p-a-0')
	for line in lines:
		key, value = clean_line(line.get_text())
		if key != None and value != None:
			csv_dict[key] = value

	# get number of reviews
	lines = soup.find_all('div', class_='hfs')
	for line in lines:
		key, value = clean_line(line.get_text())
		if key != None and value != None:
			csv_dict[key] = value

	return csv_dict

# get all links to drama listings from top ranked page
def get_top_urls(soup):
	domain = 'https://mydramalist.com'
	drama_urls = []
	titles = soup.find_all('h6', class_='title')
	for title in titles:
		path = title.a['href']
		if domain not in path:
			drama_urls.append(domain + path)
		else:
			drama_urls.append(path)
	return drama_urls

## VARIOUS TEST FUNCTIONS
def test_read():
	lines = read_csv('output/mdl_raw_data_200.csv')
	header = True
	for line in lines:
		if header:
			header_list = line
			header = False
		if "The Gifted" in line:
			print('found the gifted')
			for i in range(len(header_list)):
				print(header_list[i] + ": " + line[i])
				print('\n')

## MAIN SCRIPTS
# script to get all top urls
def main_get_top_urls():
	# generate urls
	num_pages = 26
	top_urls = []
	for i in range(1, num_pages + 1):
		top_urls.append('https://mydramalist.com/shows/top?page=' + str(i))
	
	# scrape drama listings from urls
	drama_urls = []
	for tu in top_urls:
		soup = get_soup_from_url(tu)
		drama_urls += get_top_urls(soup)
	
	write_urls('output/drama_urls.txt', drama_urls)

# script to generate CSV from list of urls
def main_get_data():
	csv_lines = []
	drama_urls = read_urls('data/drama_urls_500.txt')
	c = 0
	for url in drama_urls:
		soup = get_soup_from_url(url)
		csv_dict = parse_drama(soup)
		sorted_keys = sorted(csv_dict.keys())
		
		# write header if it doesn't exist
		if len(csv_lines) == 0:
			csv_lines.append(wrap_and_join(sorted_keys))

		# write data + sanity check
		values = dict_to_list(csv_dict)
		if len(values) != len(HEADER):
			print("Error! This line has the wrong number of items: ")
			print(values)
		csv_lines.append(wrap_and_join(values))

		# print status
		c += 1
		if c % 10 == 0:
			print("Scraping drama #" + str(c) + "... DONE")

	write_csv('data/mdl_raw_data_500.csv', csv_lines)



if __name__ == "__main__":
	# STEP 1: get urls and save in text files
	# main_get_top_urls():
	# STEP 2: scrape urls and save as CSV
	main_get_data()
