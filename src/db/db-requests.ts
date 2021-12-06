import pgClient from "./pg-client";
import {Request, Response} from "express";
import * as core from "express-serve-static-core";
import {RecordPostReqBody} from "../types";

export const getRecord = (request: Request, response: Response) => {
    pgClient.query('SELECT * FROM record', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export const getRecordByEmail = (request, response) => {
    const email = request.params.email

    pgClient.query('SELECT * FROM record WHERE email = $1', [email], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export const createRecord = (request: Request, response: Response) => {
    const { email, cname, disease_code, total_deaths, total_patients } = request.body;
    // console.log(request.body);
    pgClient.query('INSERT INTO record (email, cname, disease_code, total_deaths, total_patients) VALUES ($1, $2, $3, $4, $5)', [email, cname, disease_code, total_deaths, total_patients], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send({msg: `New record was created.`})
    })
}


export const updateRecord = (request, response) => {
    const { email, cname, disease_code, total_deaths, total_patients } = request.body;
    // console.log(request.body);
    pgClient.query(
        'UPDATE record SET total_deaths = $4, total_patients = $5 WHERE email = $1 AND cname = $2 AND disease_code = $3', [email, cname, disease_code, total_deaths, total_patients], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send({msg: `Record modified.`})
        }
    )
}

export const deleteRecord = (request, response) => {
    const { email, cname, disease_code } = request.body;

    pgClient.query('DELETE FROM record WHERE email = $1 AND cname = $2 AND disease_code = $3', [email, cname, disease_code], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send({msg: `Record was deleted.`})
    })
}

export const getCountryList = (request: Request, response: Response) => {
    pgClient.query('SELECT DISTINCT cname FROM country', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export const getDiseaseCodeList = (request: Request, response: Response) => {
    pgClient.query('SELECT DISTINCT disease_code FROM disease', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export const getPublicServantEmailList = (request: Request, response: Response) => {
    pgClient.query('SELECT DISTINCT email FROM publicservant', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

export const getDiseaseRatingByTotalPatients = (request: Request, response: Response) => {
    pgClient.query('SELECT disease_code, SUM(total_patients) FROM record GROUP BY disease_code ORDER BY SUM(total_patients) DESC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}
