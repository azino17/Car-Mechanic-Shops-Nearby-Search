from flask import Flask, request, render_template, jsonify, url_for
import pickle
from fuzzywuzzy import fuzz, process
import os
import json

# Initialize Flask app

app = Flask(__name__, template_folder='templates')

# Define the path to the backend folder
backend_folder = os.path.join(os.path.dirname(__file__), 'backend')

# Load the pre-trained model and data
new_data_path = os.path.join(backend_folder, 'car_list.pkl')
similarity_path = os.path.join(backend_folder, 'similarity.pkl')

new_data = pickle.load(open(new_data_path, 'rb'))
similarity = pickle.load(open(similarity_path, 'rb'))

# Define the recommend function
def recommend(address, pincode, city):
    input_text = address + pincode + city
    threshold = 70
    similar_addresses = process.extract(input_text, new_data['tags'], scorer=fuzz.token_sort_ratio)
    similar_garages = []
    for similar_address, score, index in similar_addresses:
        if score >= threshold:
            similar_garages.append(new_data.iloc[index]['Name'])
    # Debugging statement
    print(f"Similar garages: {similar_garages}")
    return similar_garages


# Define the home route
@app.route('/')
def home():
    return render_template('index.html')

# Define the service route
@app.route('/service')
def service():
    return render_template('service.html')

# Define the search route

@app.route('/search', methods=['POST'])
def search():
    address = request.form['address']
    pincode = request.form['pincode']
    city = request.form['city']
    
    recommended_garages = recommend(address, pincode, city)
    
    return render_template('results.html', garages=recommended_garages)



# Run the app
if __name__ == '__main__':
    app.run(debug=True,port=5001)
