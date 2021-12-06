import express, {Request, Response} from 'express';
import bodyParser from "body-parser";
import {UserGetReqQuery, UserGetResponse} from "./types";
import {RouteParameters} from "express-serve-static-core";
import * as path from "path";
import * as dbRequests from "./db/db-requests";
import pgClient from "./db/pg-client";

const app = express();

app.use(bodyParser.json({ type: 'application/json' }))

app.get("/", (req, res) => {
    console.log(process.cwd());
    res.sendFile(path.join(process.cwd(), "src/views/records.html"))
})

app.get<string, RouteParameters<string>, UserGetResponse, any, UserGetReqQuery>("/api/user", (req, res) => {
    const {query} = req;
    res.json({
        name: query.name ? query.name + " was provided" : "no name provided",
        surname: query.surname ? query.surname + " was provided" : "no surname provided",
    })
})

async function main() {
    try {
        await pgClient.connect();
        console.log("Connected to db");
    } catch(error) {
        console.log("Something went wrong during connecting to db");
    }

    let port = process.env.PORT;
    if (port == null || port == "") {
        await app.listen(3000);
    } else {
        await app.listen(port);
    }

    console.log("Server is listening 3000");
}

main()

app.get('/disease/:name', (_, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/disease.html"))
})

app.get('/api/disease/:disease_code', (req, res) => {
    const disease_code = req.params.disease_code;

    pgClient.query('SELECT disease.disease_code, pathogen, disease.description as disease_description, diseasetype.description as disease_type_description, cname, first_enc_date FROM disease INNER JOIN diseasetype ON diseasetype.id = disease.id INNER JOIN discover on disease.disease_code = discover.disease_code WHERE disease.disease_code = $1 ', [disease_code],(error, results) => {
        if (error) {
            throw error
        }
        res.send(results.rows[0]);
    })

})

app.get('/api/disease/:disease_code/record', (req, res) => {
    const disease_code = req.params.disease_code;

    pgClient.query('SELECT * FROM record WHERE disease_code = $1', [disease_code],(error, results) => {
        if (error) {
            throw error
        }
        res.send(results.rows);
    })

})

app.get('/api/disease/:disease_code/country_rating', (req, res) => {
    const disease_code = req.params.disease_code;

    pgClient.query('SELECT cname, SUM(total_patients) FROM record WHERE disease_code = $1 GROUP BY cname ORDER BY SUM(total_patients) DESC', [disease_code],(error, results) => {
        if (error) {
            throw error
        }
        res.send(results.rows);
    })

})

app.get('/api/disease/:disease_code/doctor_list', (req, res) => {
    const disease_code = req.params.disease_code;

    pgClient.query('SELECT name, surname, degree, doctor.email, users.cname FROM users INNER JOIN doctor on users.email = doctor.email INNER JOIN specialize on doctor.email = specialize.email WHERE id = (SELECT id FROM disease WHERE disease_code = $1)', [disease_code],(error, results) => {
        if (error) {
            throw error
        }
        res.send(results.rows);
    })

})

app.get('/api/disease/:disease_code/stats', (req, res) => {
    const disease_code = req.params.disease_code;

    pgClient.query('SELECT record.cname, SUM(total_patients) as sum_total_patients, SUM(total_deaths) as sum_total_deaths, population FROM record INNER JOIN country on record.cname = country.cname WHERE disease_code = $1 GROUP BY record.cname, country.population ORDER BY SUM(total_patients) DESC\n', [disease_code],(error, results) => {
        if (error) {
            throw error
        }
        res.send(results.rows);
    })

})

app.get('/api/record', dbRequests.getRecord)
app.get('/api/record/:email', dbRequests.getRecordByEmail)
app.post('/api/record', dbRequests.createRecord)
app.put('/api/record', dbRequests.updateRecord)
app.delete('/api/record', dbRequests.deleteRecord)
app.get('/api/countrylist', dbRequests.getCountryList)
app.get('/api/diseasecodelist', dbRequests.getDiseaseCodeList)
app.get('/api/publicservantemaillist', dbRequests.getPublicServantEmailList)
app.get('/api/diseaseRating', dbRequests.getDiseaseRatingByTotalPatients)
