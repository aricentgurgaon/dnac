# Constellation:
----------------
An idea of connecting different stars like DNA-C , Blockchain/Sawtooth was conceived to cater the existing Network and Assets Management system which was then shaped and built as a challenge and delivered as a bright shining Constellation.
Constellation is a Blockchain framework based application providing a unified solution for Asset Management and Tracking right from procurement to discovery to configuration to compliance and their auditing using DNA-C API's .


Components:
-----------
1. Node Server: Runs the application server and handles the backend processing.
2. Blockchain: Provides the blockchain implementation, provides APIs to the Node Server for operations.
3. User Interface: Provides the user interface for interacting with the Constellation.


Pre-requisites:
---------------
The following packages must be installed on the system:
1. nodejs
2. git
3. mongodb


Usage:
------
Clone the application from the link: https://github.com/aricentgurgaon/dnac



To start blockchain:
1. Configuring docker and starting sawtooth:
   a. Install docker engine
   b. Install docker compose
      For more details please refer to this link: https://sawtooth.hyperledger.org/docs/core/releases/1.0/app_developers_guide/docker.html
   c. Start the docker: systemctl start docker
   d. Now inside blockChain directory run the command: docker-compose -f docker-compose.yaml up
   e. Check if the dockers are up (transaction processor, client, rest-api, validator): docker ps
   
2. Install these packages inside client docker:
   a. flask
   b. request
   c. openssl
   
3. Generate ssl keys inside pyclient:
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

4. Now inside client-docker run the file pyclient/testAPI.py (to expose blockchain APIs).



To start node application: 
1. Go inside directory nodejs-server
2. node main.js



To start UI:
1. Go to directory UI\aricent-am
2. Run command npm start
3. Now open the link in browser: http://localhost:8000/#/login
