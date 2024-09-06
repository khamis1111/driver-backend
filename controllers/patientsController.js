const slugify = require("slugify");
const patientsModel = require("../models/patientsModel");
const handlersFactory = require("./factory/handlersFactory");
const expressAsyncHandler = require("express-async-handler");

module.exports = {
    // @desc   Add patients
    // @Route  POST /api/v1/patients
    // @Access Private
    addPatients: handlersFactory.addOne(patientsModel),
    // @desc   Get All patients
    // @Route  GET /api/v1/patients
    // @Access Private
    getAllPatients: handlersFactory.getAll(patientsModel, "patients"),
    // @desc   Get One patients
    // @Route  GET /api/v1/patients/:id
    // @Access Private
    getOnePatients: handlersFactory.getOne(patientsModel),
    // @desc   Update patients
    // @Route  PUT /api/v1/patients/:id
    // @Access Private
    updatePatients: handlersFactory.updateOne(patientsModel),
    // @desc   Delete One patients
    // @Route  DELETE /api/v1/patients/:id
    // @Access Private
    deletePatients: handlersFactory.deleteOne(patientsModel),
    // @desc   Delete All patients
    // @Route  DELETE /api/v1/patients
    // @Access Private
    deleteAllPatients: handlersFactory.deleteAll(patientsModel),
    // @desc   Set Slugify => Add & Update patients
    // @Route  POST /api/v1/patients, PUT /api/v1/patients/:id
    // @Access Private
    filterObj: (req, res, next) => {
        if (req.body.patientName) req.body.slug = slugify(req.body.patientName)
        next()
    },
    // @desc   Pay With Card
    // @Route  POST /api/v1/patients/checkout/:idPatient
    // @Access Public
    payCard: expressAsyncHandler(async (req, res, next) => {
        const document = await patientsModel.findById(req.params.id)

        var myHeaders = new Headers();
        myHeaders.append("Authorization", process.env.PAYMOB_SECRET_KEY);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "amount": (document.price * 100).toString(),
            "currency": "EGP",
            "expiration": 5800,
            "redirection_url": `${req.body.redirection_url}`,
            "payment_methods": [
                Number(process.env.PAYMOB_INTGERATION)
            ],
            "items": [],
            "billing_data": {
                "apartment": "NA",
                "first_name": document.patientName.split(' ')[0],
                "last_name": document.patientName.split(' ')[1] || document.patientName.split(' ')[0],
                "street": "NA",
                "building": "NA",
                "phone_number": document.phone,
                "country": "NA",
                "email": document.email || 'example@gmail.com',
                "floor": "NA",
                "state": "NA"
            },
            "special_reference": document._id,
            "customer": {
                "first_name": document.patientName.split(' ')[0],
                "last_name": document.patientName.split(' ')[1] || document.patientName.split(' ')[0],
                "email": document.email || 'example@gmail.com',
                "extras": {
                    "re": "22"
                }
            },
            "extras": {
                "ee": 22
            }
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://accept.paymob.com/v1/intention/", requestOptions)
            .then(response => response.json())
            .then(result => {
                res.status(201).json({
                    status: 'Success',
                    data: result,
                    payUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${result.client_secret}`
                })
            })
            .catch(error => next(new ApiError(`There is a problem ${error}`)));
    }),
}