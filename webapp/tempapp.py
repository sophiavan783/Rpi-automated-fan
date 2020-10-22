from flask import Flask,render_template,url_for,request,redirect, make_response
app = Flask(__name__, static_url_path='/static')

@app.route("/")
def main():
    return render_template('tempapp.html')

if __name__ == "__main__":
  app.run(host='0.0.0.0',debug=True)
