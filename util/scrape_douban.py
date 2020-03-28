from bs4 import BeautifulSoup
import requests

HEADER = [
	'rating',
	'num_ratings',
	'other_names',
	'imdb_id',
	'num_reviews']

def get_soup_from_url(url):
	r = requests.get(url)
	print(r.status_code)
	soup = BeautifulSoup(r.text, features='lxml')
	return soup

def get_soup_from_file(file):
	soup = ''
	with open(file) as f:
		soup = BeautifulSoup(f, features='lxml')
	return soup

# input: a list of items
# output: formatted key and value
def clean_line(line):
	if len(line) != 2:
		return (None, None)
	key = line[0]
	value = line[1]
	# remove pound sign
	return (key, value)

def parse_drama(soup):
	csv_dict = {}
	rating_div = soup.find_all('div', class_='rating_self')[0]

	# get rating
	rating = rating_div.find('strong', class_='rating_num').get_text()
	csv_dict['rating'] = rating

	# get num_ratings
	num_ratings = rating_div.find('span', {'property': 'v:votes'}).get_text()
	csv_dict['num_ratings'] = num_ratings

	# get other_names, IMDb id
	info = soup.find('div', {'id': 'info'}).find_all('span', class_='pl')
	for item in info:
		label = item.get_text()
		if '又名' in label:
			other_names = item.next_sibling.strip()
			csv_dict['other_names'] = other_names
		elif 'IMDb链接' in label:
			imdb_id = item.find_next('a').get_text().strip()
			csv_dict['imdb_id'] = imdb_id

	# get num_reviews
	review_text = soup.find('section', class_='reviews').find('span', class_='pl').get_text()
	num_reviews = [s for s in review_text.split() if s.isdigit()]
	if (len(num_reviews) != 1):
		print('Error! Could not parse number of reviews from text: ' + str(review_text))
	num_reviews = num_reviews[0]
	csv_dict['num_reviews'] = num_reviews

	print(csv_dict)

if __name__ == "__main__":
	# url = "https://movie.douban.com/subject/21355794/?tag=%E7%83%AD%E9%97%A8&from=gaia_video"
	url = 'https://movie.douban.com/'
	soup = get_soup_from_url(url)
	# soup = get_soup_from_file('douban_untamed.htm')
	# parse_drama(soup)