# Clinic Management Database
This project is a clinic management system that allows users to manage patients, doctors, appointments, and prescriptions.

--- 

## Features
- MySQL Database
- CRUD operations (Create, Read, Update, Delete)
- Frontend Interface
- API to connect frontend to database

--- 

## How to Run
### 1. Database Setup:
- Open MySQL Workbench
- Run `schema.sql` to create database and tables
- Run `seed_data.sql` to insert sample data
- Run `views.sql` to create views
- Afterward any queries, search & filter and report building files can run

### 2. Backend Setup:
- Open server.js file and update MySQL password if needed
- Open a terminal & navigate (cd) into folder 
- Run "npm install"
- Start the server "node server.js"
- Backend will run at http://localhost:3000

### 3. Frontend
- Open index.html file in browser
  #### Note: Backend (Database + API) must be running for frontend to fetch data from database
