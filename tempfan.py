import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import Adafruit_BMP.BMP085 as BMP085
import RPi.GPIO as GPIO
import time
from datetime import datetime
import json

sensor = BMP085.BMP085()

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18, GPIO.OUT)
GPIO.output(18, False)
fanon = False

temperature = sensor.read_temperature()
currentime = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
print("Program successfully initiated:\n" + str(currentime) + ": Currently " + str(temperature) + " degree celcius")

def on_connect(client, userdata, flags, rc):
    client.subscribe("tempdata/sophiaautomation")

def on_message(client, userdata, msg):
    global fanon
    m_decode = str(msg.payload.decode('utf-8','ignore'))
    m_in = json.loads(m_decode)
    if m_in['automation'] == 'start':
        if temperature >= float(m_in['temperature']) and fanon == False:
                print("Temperature is higher than threshold: Turning fan on")
                GPIO.output(18, True)
                fanon = True

        elif temperature < float(m_in['temperature']) and fanon == True:
                print("Temperature is lower than threshold: turning fan off")
                GPIO.output(18, False)
                fanon = False

    elif m_in['automation'] == 'stop':
        GPIO.output(18, False)
        fanon = False

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect('broker.hivemq.com',1883,60)
client.loop_start()

try:
   while 1:
        tempdata = {"datetime": datetime.now().isoformat(), "temperature": temperature}
        tempjson = json.dumps(tempdata)
        temperature = sensor.read_temperature()
        publish.single('tempdata/sophia', tempjson, hostname='broker.hivemq.com')
        time.sleep(1)

except KeyboardInterrupt:
   GPIO.output(18, False)
   fanon = False
   print('program exited cleanly')
