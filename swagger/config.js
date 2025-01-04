// // swaggerConfig.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {

        openapi: "3.0.0",
        "info": {
            "title": "ACAD PROJECT",
            "version": "1.0.0",
            "description": "Ce projet est développé par Groupe 3, en 2ème année d-Ingénierie(2 ING 2):Kmar Mlayhi,Hend Haddad,Abir Gharbi,Rania Hammami,Chedly Chahed,Skander Konte,Orsowen Ben Abdallah"
        },
        "host": "localhost:8800",
        "basePath": "/",
        "schemes": [
            "http"
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT", // Correct format for JWT tokens
                    description: "Provide a Bearer token for authentication"
                }
            }
        },

        security: [
            {
                BearerAuth: []  // Apply the security globally for all endpoints
            }
        ],
        "paths": {
            "/choices/{id}": {
                "get": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],

                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/choices": {
                "post": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "subjectId": {
                                        "example": "any"
                                    },
                                    "priority": {
                                        "example": "any"
                                    },
                                    "binomeId": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/choices/updatePriority": {
                "patch": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "choiceId": {
                                        "example": "any"
                                    },
                                    "newPriority": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/choices/acceptation": {
                "patch": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "choiceId": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/choices/assign": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/choices/{id}/assign/student/{studentId}": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "studentId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/publish/{response}": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/sendMail": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/clearChoices": {
                "post": {
                    "description": "",
                    "tags": [
                        "Choice"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/soutenances": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "enseignantId": {
                                        "example": "any"
                                    },
                                    "salle": {
                                        "example": "any"
                                    },
                                    "date": {
                                        "example": "any"
                                    },
                                    "heure": {
                                        "example": "any"
                                    },
                                    "type": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "date": {
                                        "example": "any"
                                    },
                                    "startTime": {
                                        "example": "any"
                                    },
                                    "endTime": {
                                        "example": "any"
                                    },
                                    "room": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "rapporteur": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/soutenances/publish/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/soutenances/send": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/open": {
                "post": {
                    "description": "",
                    "tags": [
                        "Period"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "For": {
                                        "example": "any"
                                    },
                                    "Start_Deposit": {
                                        "example": "any"
                                    },
                                    "End_Deposit": {
                                        "example": "any"
                                    },
                                    "Start_Choice": {
                                        "example": "any"
                                    },
                                    "End_Choice": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "tags": [
                        "Period"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "tags": [
                        "Period"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "For": {
                                        "example": "any"
                                    },
                                    "Start_Deposit": {
                                        "example": "any"
                                    },
                                    "End_Deposit": {
                                        "example": "any"
                                    },
                                    "Start_Choice": {
                                        "example": "any"
                                    },
                                    "End_Choice": {
                                        "example": "any"
                                    },
                                    "lateDepotCode": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/testArcvhive": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        }
                    }
                }
            },
            "/test-notif-late-depot-satge": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "horaire",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "meet_link",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "startDate",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "endDate",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "horaire": {
                                        "example": "any"
                                    },
                                    "day": {
                                        "example": "any"
                                    },
                                    "meet_link": {
                                        "example": "any"
                                    },
                                    "internship": {
                                        "example": "any"
                                    },
                                    "shouldSendMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/me": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "horaire": {
                                        "example": "any"
                                    },
                                    "day": {
                                        "example": "any"
                                    },
                                    "meet_link": {
                                        "example": "any"
                                    },
                                    "shouldSendMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/send": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/publish/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/assigned-to-me": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/me": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "Type",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "teacherId",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/pv": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "Type",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "teacherId",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "documents": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "typeInternship": {
                                        "example": "any"
                                    },
                                    "nomSociete": {
                                        "example": "any"
                                    },
                                    "topicDetails": {
                                        "example": "any"
                                    },
                                    "noDocs": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "Type",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "studentId",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "teacherId",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "topicDetails": {
                                        "example": "any"
                                    },
                                    "nomSociete": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "isValid": {
                                        "example": "any"
                                    },
                                    "reasonIfNotValid": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/{id}/documents": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "topicDetails": {
                                        "example": "any"
                                    },
                                    "nomSociete": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/assign": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "teacherIds": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/update": {
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "internshipIds": {
                                        "example": "any"
                                    },
                                    "teacherId": {
                                        "example": "any"
                                    },
                                    "forceReplace": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/planning/remove-all-assigned": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/internships/stage/open": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "For": {
                                        "example": "any"
                                    },
                                    "Start_Deposit": {
                                        "example": "any"
                                    },
                                    "End_Deposit": {
                                        "example": "any"
                                    },
                                    "Start_Choice": {
                                        "example": "any"
                                    },
                                    "End_Choice": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/{id}": {
                "get": {
                    "description": "",
                    "tags": [
                        "users"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "password": {
                                        "example": "any"
                                    },
                                    "role": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "isArchived": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/cin/{cin}": {
                "get": {
                    "description": "",
                    "tags": [
                        "users"
                    ],
                    "parameters": [
                        {
                            "name": "cin",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/": {
                "post": {
                    "description": "",
                    "tags": [
                        "users"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "role": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/register": {
                "post": {
                    "description": "",
                    "tags": [
                        "Authentification"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/login": {
                "post": {
                    "description": "",
                    "tags": [
                        "Authentification"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "password": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/users/{id}/password": {
                "patch": {
                    "description": "",
                    "tags": [
                        "users"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "newpassword": {
                                        "example": "any"
                                    },
                                    "passwordConfirmation": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/teachers/me": {
                "get": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "subjectCount": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/teachers/": {
                "get": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "search",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "sort",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "cin": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "subjectCount": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/teachers/{id}": {
                "get": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "subjectCount": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "isArchived": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/teachers/file": {
                "post": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/teachers/{id}/password": {
                "patch": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "newpassword": {
                                        "example": "any"
                                    },
                                    "passwordConfirmation": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/students/me": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "arabicFirstName": {
                                        "example": "any"
                                    },
                                    "arabicLastName": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "address": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/students/file": {
                "post": {
                    "description": "",
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/students/": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "cin": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "arabicLastName": {
                                        "example": "any"
                                    },
                                    "arabicFirstName": {
                                        "example": "any"
                                    },
                                    "birthDate": {
                                        "example": "any"
                                    },
                                    "governorate": {
                                        "example": "any"
                                    },
                                    "gender": {
                                        "example": "any"
                                    },
                                    "city": {
                                        "example": "any"
                                    },
                                    "postalCode": {
                                        "example": "any"
                                    },
                                    "nationality": {
                                        "example": "any"
                                    },
                                    "bac": {
                                        "example": "any"
                                    },
                                    "grade": {
                                        "example": "any"
                                    },
                                    "isPrepa": {
                                        "example": "any"
                                    },
                                    "university": {
                                        "example": "any"
                                    },
                                    "etablissement": {
                                        "example": "any"
                                    },
                                    "speciality": {
                                        "example": "any"
                                    },
                                    "licenseYear": {
                                        "example": "any"
                                    },
                                    "M1university": {
                                        "example": "any"
                                    },
                                    "M1Etablissement": {
                                        "example": "any"
                                    },
                                    "M1speciality": {
                                        "example": "any"
                                    },
                                    "M1Year": {
                                        "example": "any"
                                    },
                                    "M1Type": {
                                        "example": "any"
                                    },
                                    "cFil": {
                                        "example": "any"
                                    },
                                    "scoreG": {
                                        "example": "any"
                                    },
                                    "bacYear": {
                                        "example": "any"
                                    },
                                    "address": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "search",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isArchived",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "grade",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nationality",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "sort",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/students/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "isArchived": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/students/{id}/password": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "newpassword": {
                                        "example": "any"
                                    },
                                    "passwordConfirmation": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/students/CV/me": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "Title": {
                                        "example": "any"
                                    },
                                    "phoneNum": {
                                        "example": "any"
                                    },
                                    "adress": {
                                        "example": "any"
                                    },
                                    "socialMediaLinks": {
                                        "example": "any"
                                    },
                                    "competence": {
                                        "example": "any"
                                    },
                                    "languages": {
                                        "example": "any"
                                    },
                                    "skills": {
                                        "example": "any"
                                    },
                                    "hobbies": {
                                        "example": "any"
                                    },
                                    "WorkExperience": {
                                        "example": "any"
                                    },
                                    "education": {
                                        "example": "any"
                                    },
                                    "academicprojects": {
                                        "example": "any"
                                    },
                                    "objective": {
                                        "example": "any"
                                    },
                                    "Bio": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/students/{id}/CV": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/PFE/post": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "documents": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "Nom_societe": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "topic": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/{id}": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "Nom_societe": {
                                        "example": "any"
                                    },
                                    "documents": {
                                        "example": "any"
                                    },
                                    "topic": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/{id}/choice": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/planning/assign": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "ids": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/{id}/planning/assign": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "teacherId": {
                                        "example": "any"
                                    },
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/planning/publish/{response}": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/planning/send": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/me": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/student/me": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/PFE/{id}/soutenances": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "enseignantId": {
                                        "example": "any"
                                    },
                                    "salle": {
                                        "example": "any"
                                    },
                                    "date": {
                                        "example": "any"
                                    },
                                    "heure": {
                                        "example": "any"
                                    },
                                    "type": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/soutenances/publish/{response}": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFE/soutenances/send": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFE"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/test-notifications/": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/competences/": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "example": "any"
                                    },
                                    "description": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/competences/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "example": "any"
                                    },
                                    "description": {
                                        "example": "any"
                                    },
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/student/mysubjects": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/teacher/mysubjects": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}/avancement": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "chapterName": {
                                        "example": "any"
                                    },
                                    "sectionName": {
                                        "example": "any"
                                    },
                                    "status": {
                                        "example": "any"
                                    },
                                    "date": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "title": {
                                        "example": "any"
                                    },
                                    "skills": {
                                        "example": "any"
                                    },
                                    "level": {
                                        "example": "any"
                                    },
                                    "semester": {
                                        "example": "any"
                                    },
                                    "curriculum": {
                                        "example": "any"
                                    },
                                    "teachers": {
                                        "example": "any"
                                    },
                                    "students": {
                                        "example": "any"
                                    },
                                    "published": {
                                        "example": "any"
                                    },
                                    "option": {
                                        "example": "any"
                                    },
                                    "chargeHoraire": {
                                        "example": "any"
                                    },
                                    "coeff": {
                                        "example": "any"
                                    },
                                    "credit": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "title": {
                                        "example": "any"
                                    },
                                    "skills": {
                                        "example": "any"
                                    },
                                    "level": {
                                        "example": "any"
                                    },
                                    "semester": {
                                        "example": "any"
                                    },
                                    "curriculum": {
                                        "example": "any"
                                    },
                                    "teachers": {
                                        "example": "any"
                                    },
                                    "students": {
                                        "example": "any"
                                    },
                                    "published": {
                                        "example": "any"
                                    },
                                    "option": {
                                        "example": "any"
                                    },
                                    "chargeHoraire": {
                                        "example": "any"
                                    },
                                    "coeff": {
                                        "example": "any"
                                    },
                                    "credit": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/publish/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "subjectId": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}/proposition": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "curriculum": {
                                        "example": "any"
                                    },
                                    "raison": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}/validate": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}/evaluationById": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/evaluation": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/matieres/{id}/evaluation": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "feedback": {
                                        "example": "any"
                                    },
                                    "rating": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/post": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "subjects": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/mine": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/{id}": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "binomeExits": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "description": {
                                        "example": "any"
                                    },
                                    "binome": {
                                        "example": "any"
                                    },
                                    "monome": {
                                        "example": "any"
                                    },
                                    "technologies": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/{id}/mine": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "tags": [
                        "PFA"
                    ],
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "tags": [
                        "PFA"
                    ],
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "binomeExits": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "description": {
                                        "example": "any"
                                    },
                                    "binome": {
                                        "example": "any"
                                    },
                                    "monome": {
                                        "example": "any"
                                    },
                                    "technologies": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/publish": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/reject/{id}": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/approve/{id}": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/first-send": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "default": {
                            "description": ""
                        }
                    }
                }
            },
            "/PFA/modified-send": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "default": {
                            "description": ""
                        }
                    }
                }
            },
            "/PFA/teacher/{teacherId}": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "teacherId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/Soutenances": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "days": {
                                        "example": "any"
                                    },
                                    "rooms": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/planning/teacher/{teacherId}": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "teacherId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/planning/student/{studentId}": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "studentId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/{id}/soutenances": {
                "patch": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "date": {
                                        "example": "any"
                                    },
                                    "startTime": {
                                        "example": "any"
                                    },
                                    "endTime": {
                                        "example": "any"
                                    },
                                    "room": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "rapporteur": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/list/send": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/student/soutenance": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/soutenances/teacher": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/soutenances/{id}/teacher": {
                "get": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PFA/PublishSoutenance/{response}": {
                "post": {
                    "description": "",
                    "tags": [
                        "PFA"
                    ],
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/years/student/{id}": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "status": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/years/": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/years/notify": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/years/archive": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "Year",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "archiveOf",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/assigned-to-me": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/me": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "subjectCount": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/pv": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "isValid",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "Type",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "teacherId",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "day",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "nomSociete",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "role": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "password": {
                                        "example": "any"
                                    },
                                    "role": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "isArchived": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/documents": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "topicDetails": {
                                        "example": "any"
                                    },
                                    "nomSociete": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/assign": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "teacherIds": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "ids": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/update": {
                "put": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "internshipIds": {
                                        "example": "any"
                                    },
                                    "teacherId": {
                                        "example": "any"
                                    },
                                    "forceReplace": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/remove-all-assigned": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/post": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lateDepotCode": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "documents": {
                                        "example": "any"
                                    },
                                    "StartDate": {
                                        "example": "any"
                                    },
                                    "EndDate": {
                                        "example": "any"
                                    },
                                    "Nom_societe": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "topic": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/mine": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/mine": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "delete": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "binomeExits": {
                                        "example": "any"
                                    },
                                    "title": {
                                        "example": "any"
                                    },
                                    "description": {
                                        "example": "any"
                                    },
                                    "binome": {
                                        "example": "any"
                                    },
                                    "monome": {
                                        "example": "any"
                                    },
                                    "technologies": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/publish": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/reject/{id}": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/approve/{id}": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/first-send": {
                "get": {
                    "description": "",
                    "responses": {
                        "default": {
                            "description": ""
                        }
                    }
                }
            },
            "/modified-send": {
                "get": {
                    "description": "",
                    "responses": {
                        "default": {
                            "description": ""
                        }
                    }
                }
            },
            "/teacher/{teacherId}": {
                "get": {
                    "description": "",
                    "tags": [
                        "teachers"
                    ],
                    "parameters": [
                        {
                            "name": "teacherId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/choice": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/planning/assign": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "teacherId": {
                                        "example": "any"
                                    },
                                    "force": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/publish/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/send": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/student/me": {
                "get": {
                    "description": "",
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/Soutenances": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "days": {
                                        "example": "any"
                                    },
                                    "rooms": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/teacher/{teacherId}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "teacherId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/planning/student/{studentId}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "studentId",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/list/send": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/student/soutenance": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/soutenances/teacher": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/soutenances/{id}/teacher": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/PublishSoutenance/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/send": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/publish/{response}": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "response",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "subjectId": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/student/{id}": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "status": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/notify": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/archive": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "Year",
                            "in": "query",
                            "type": "string"
                        },
                        {
                            "name": "archiveOf",
                            "in": "query",
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/file": {
                "post": {
                    "description": "",
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/{id}/password": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "newpassword": {
                                        "example": "any"
                                    },
                                    "passwordConfirmation": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/CV/me": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "lastName": {
                                        "example": "any"
                                    },
                                    "firstName": {
                                        "example": "any"
                                    },
                                    "Title": {
                                        "example": "any"
                                    },
                                    "phoneNum": {
                                        "example": "any"
                                    },
                                    "adress": {
                                        "example": "any"
                                    },
                                    "socialMediaLinks": {
                                        "example": "any"
                                    },
                                    "competence": {
                                        "example": "any"
                                    },
                                    "languages": {
                                        "example": "any"
                                    },
                                    "skills": {
                                        "example": "any"
                                    },
                                    "hobbies": {
                                        "example": "any"
                                    },
                                    "WorkExperience": {
                                        "example": "any"
                                    },
                                    "education": {
                                        "example": "any"
                                    },
                                    "academicprojects": {
                                        "example": "any"
                                    },
                                    "objective": {
                                        "example": "any"
                                    },
                                    "Bio": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/{id}/CV": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        }
                    }
                }
            },
            "/student/mysubjects": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/teacher/mysubjects": {
                "get": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/avancement": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "chapterName": {
                                        "example": "any"
                                    },
                                    "sectionName": {
                                        "example": "any"
                                    },
                                    "status": {
                                        "example": "any"
                                    },
                                    "date": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/proposition": {
                "patch": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "curriculum": {
                                        "example": "any"
                                    },
                                    "raison": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/validate": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/evaluationById": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/evaluation": {
                "post": {
                    "description": "",
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/{id}/evaluation": {
                "post": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "feedback": {
                                        "example": "any"
                                    },
                                    "rating": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                },
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/cin/{cin}": {
                "get": {
                    "description": "",
                    "parameters": [
                        {
                            "name": "cin",
                            "in": "path",
                            "required": true,
                            "type": "string"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/register": {
                "post": {
                    "description": "",
                    "tags": [
                        "Authentification"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "phone": {
                                        "example": "any"
                                    },
                                    "email": {
                                        "example": "any"
                                    },
                                    "teacher": {
                                        "example": "any"
                                    },
                                    "student": {
                                        "example": "any"
                                    },
                                    "sendCredsInMail": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Created"
                        },
                        "400": {
                            "description": "Bad Request"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            },
            "/login": {
                "post": {
                    "description": "",
                    "tags": [
                        "Authentification"
                    ],
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cin": {
                                        "example": "any"
                                    },
                                    "password": {
                                        "example": "any"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "OK"
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "403": {
                            "description": "Forbidden"
                        },
                        "404": {
                            "description": "Not Found"
                        },
                        "500": {
                            "description": "Internal Server Error"
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js'], // This will include all the .js files in the routes folder

};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };
