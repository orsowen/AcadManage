// controllers/internship.controller.js

import DepositPeriod from '../models/DepositPeriod.js';
import Internship from '../models/Internship.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teachers.js';

const validateFiles = (documents) => {
    const fileValidation = /\.(pdf|docx)$/i; // Regular expression for validating .pdf or .docx files
    const { attestation, rapport, ficheEval } = documents;

    // Check if each file is non-null and follows the allowed extension
    if (
        (attestation && !fileValidation.test(attestation)) ||
        (rapport && !fileValidation.test(rapport)) ||
        (ficheEval && !fileValidation.test(ficheEval))
    ) {
        return {
            isValid: false,
            message: "Invalid file format. Only PDF or DOCX files are allowed for attestation, rapport, and ficheEval.",
        };
    }

    return { isValid: true }; // All files are valid or skipped
};


// Add a new internship
export const addInternship = async (req, res) => {
    const {
        title,
        documents,
        StartDate,
        EndDate,
        typeInternship,
        nomSociete,
        teacherId,
        topicDetails,
        noDocs = false
    } = req.body;
    const studentId = req.user.idRole; // Extract student ID from JWT token

    // Validate date input
    if (new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Validate topic details
        if (!topicDetails || !topicDetails.title || !topicDetails.description || !topicDetails.techList) {
            return res.status(400).json({ error: "Les détails du sujet (topicDetails) sont incomplets." });
        }

        // Handle document validation if `noDocs` is false
        if (!noDocs) {
            const fileValidation = validateFiles(documents);
            if (!fileValidation.isValid) {
                return res.status(400).json({ error: fileValidation.message });
            }
        }

        // Ensure documents are set to `null` if `noDocs` is true
        const validatedDocuments = noDocs
            ? { ficheEval: null, attestation: null, rapport: null }
            : documents;

        // Validate student existence
        const student = studentId ? await Student.findById(studentId) : null;
        if (studentId && !student) {
            return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
        }

        // Validate teacher existence
        const teacher = teacherId ? await Teacher.findById(teacherId) : null;
        if (teacherId && !teacher) {
            return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
        }

        // Ensure teacher has available slots
        if (teacher && teacher.subjectCount <= teacher.assignedInternships.length) {
            return res.status(400).json({ error: `Teacher ${teacher.firstName} ${teacher.lastName} has no available slots.` });
        }

        // Determine deposit status based on the latest deposit period
        const depositPeriod = await DepositPeriod.findOne({ For: "STAGE" }).sort({ End_Deposit: -1 });
        const depotStatus = depositPeriod && new Date(depositPeriod.End_Deposit) < new Date()
            ? "late"
            : "in time";

        // Create the internship object
        const newInternship = new Internship({
            title,
            documents: validatedDocuments,
            StartDate,
            EndDate,
            nomSociete,
            typeInternship,
            topic: {
                title: topicDetails.title,
                description: topicDetails.description,
                techList: topicDetails.techList,
            },
            student: studentId || null,
            teacher: teacherId || null,
            depotStatus,
        });

        // Save the internship
        const savedInternship = await newInternship.save();

        // Update teacher's assigned internships
        if (teacher) {
            teacher.assignedInternships.push(savedInternship._id);
            await teacher.save();
        }

        // Respond with the created internship
        const response = {
            message: "Internship created successfully.",
        };
        if (!documents || !documents.ficheEval || !documents.attestation || !documents.rapport) {
            response.warning = "Les documents sont incomplets.";
        }
        response.internship = savedInternship;
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding internship:", error.message);

        res.status(500).json({
            error: "Erreur lors de l'ajout du stage.",
            details: error.message,
        });
    }
};


// get all Internships
export const getAllInternships = async (req, res) => {
    const {
        page = 1,
        limit = 5,
        isValid,
        Type,
        studentId,
        teacherId,
        day,
        nomSociete
    } = req.query;

    // Convert page and limit to integers and ensure valid values
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 5;

    // Build the filter object dynamically
    let filter = {};
    if (isValid !== undefined) filter.isValid = isValid === 'true'; // Ensure 'isValid' is a boolean
    if (Type) filter.Type = Type;
    if (studentId) filter.student = studentId;
    if (teacherId) filter.teacher = teacherId;
    if (day) filter.day = new Date(day); // Ensure 'day' is a valid date
    if (nomSociete) filter.nomSociete = new RegExp(nomSociete, 'i'); // Case-insensitive search for 'nomSociete'

    try {
        // Fetch internships with filters, pagination, and population
        const internships = await Internship.find(filter)
            .populate({
                path: 'student',
                select: 'firstName lastName',
                populate: {
                    path: 'user',
                    select: 'email', // Populate the user's email linked to the student
                },
            })
            .populate({
                path: 'teacher',
                select: 'firstName lastName',
                populate: {
                    path: 'user',
                    select: 'email', // Populate the user's email linked to the teacher
                },
            })
            .populate({
                path: 'planning', // Populate the planningStage details (assuming a reference exists in the Internship model)
                select: 'horaire day meet_link isPublished sendStatus', // Select the relevant fields from the planning stage
            })
            .skip((currentPage - 1) * currentLimit) // Skip results based on the page number
            .limit(currentLimit) // Limit the results to the specified number
            .exec();

        // Fetch total count of internships
        const total = await Internship.countDocuments(filter);

        res.status(200).json({
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: internships,
        });
    } catch (error) {
        console.error("Error fetching internships:", error.message);
        res.status(500).json({ error: "Failed to fetch internships." });
    }
};

// Get a specific internship by ID
export const getInternshipById = async (req, res) => {
    const { id } = req.params;

    try {
        const internship = await Internship.findById(id)
            .populate({
                path: 'student',
                select: 'firstName lastName',
                populate: {
                    path: 'user',
                    select: 'email', // Populate the user's email linked to the student
                },
            })
            .populate({
                path: 'teacher',
                select: 'firstName lastName',
                populate: {
                    path: 'user',
                    select: 'email', // Populate the user's email linked to the teacher
                },
            })
            .populate({
                path: "planning", // Populate
                select: "horaire day meet_link",
            })
            .exec();

        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable." });
        }

        res.status(200).json({
            message: "Internship fetched successfully.",
            data: internship,
        });
    } catch (error) {
        console.error("Error fetching internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération du stage." });
    }
};

// Update an internship and its associated topic (if true update only the documents)
export const updateInternship = (onlyDocument = false) => async (req, res) => {
    const { idRole: studentId, role } = req.user; // Extract student ID and role from JWT token
    const { id } = req.params;
    const { title, documents = {}, StartDate, EndDate, topicDetails, nomSociete } = req.body;

    // Validate date range if provided
    if (StartDate && EndDate && new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Fetch the internship for updating
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        // Ensure the user is authorized to update the internship (student or admin)
        if (internship.student._id.toString() !== studentId && role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        // Initialize documents if not provided
        if (!internship.documents) {
            internship.documents = {};
        }
        // Handle document update (ficheEval, attestation, rapport)
        const { ficheEval, attestation, rapport } = documents;

        // Validate documents if provided
        if (ficheEval || attestation || rapport) {
            const fileValidation = validateFiles(documents);
            if (!fileValidation.isValid) {
                return res.status(400).json({ error: fileValidation.message });
            }

            // Update internship documents, set null if not provided
            internship.documents.ficheEval = ficheEval || null;
            internship.documents.attestation = attestation || null;
            internship.documents.rapport = rapport || null;
        }

        // Update depotStatus and isDeposed if documents are complete
        if (ficheEval && attestation && rapport) {
            const depositPeriod = await DepositPeriod.findOne({ For: "STAGE" }).sort({ End_Deposit: -1 });
            internship.depotStatus = depositPeriod && new Date(depositPeriod.End_Deposit) < new Date() ? "late" : "in time";
            internship.isDeposed = true;
        } else {
            internship.isDeposed = false; // Set to false if documents are not complete
        }

        // Update other fields if not only updating documents
        if (!onlyDocument) {
            if (topicDetails) {
                const { title, description, techList } = topicDetails;
                if (!title || !description || !techList) {
                    return res.status(400).json({ error: "Les détails du sujet sont incomplets." });
                }
                internship.topic.title = title;
                internship.topic.description = description;
                internship.topic.techList = techList;
            }

            // Update internship fields (title, dates, company name)
            if (title) internship.title = title;
            if (StartDate) internship.StartDate = StartDate;
            if (EndDate) internship.EndDate = EndDate;
            if (nomSociete) internship.nomSociete = nomSociete;
        }

        // Update student if studentId is provided
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
            }
            internship.student = studentId;
        }

        // Save the updated internship
        const updatedInternship = await internship.save();
        res.status(200).json({ message: "Internship updated successfully", updatedInternship });

    } catch (error) {
        console.error("Error updating internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour du stage." });
    }
};

// Delete an internship by ID
export const deleteInternship = async (req, res) => {
    const { id } = req.params;
    const { force } = req.body;

    try {
        // SOFT DELETE
        if (!force) {
            const internship = await Internship.findById(id);
            if (!internship) {
                return res.status(404).json({ message: "Stage introuvable." });
            }
            internship.isArchived = true;
            await internship.save();
            return res.status(200).json({ message: 'Internship archived successfully.' });
        }
        // HARD DELETE
        const deletedInternship = await Internship.findByIdAndDelete(id);

        if (!deletedInternship) {
            return res.status(404).json({ message: "Stage introuvable." });
        }

        res.status(200).json({ message: "Stage supprimé avec succès." });
    } catch (error) {
        console.error("Error deleting internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la suppression du stage." });
    }
};

// MANUAL ADDING TEACHER TO INTERNSHIPS
export const addTeacherToInternship = async (req, res) => {
    try {
        const { internshipIds, teacherId, forceReplace = false } = req.body; // Adding forceReplace option

        // Check if internshipIds is an array and not empty
        if (!Array.isArray(internshipIds) || internshipIds.length === 0) {
            return res.status(400).json({ message: 'Please provide a valid list of internship IDs.' });
        }

        // Fetch the teacher
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        // Check if the teacher has space to take more internships
        if (teacher.subjectCount <= teacher.assignedInternships.length) {
            return res.status(400).json({ message: 'Teacher assignment is full.' });
        }

        // Initialize arrays to keep track of success and failure
        const success = [];
        const failures = [];

        // Loop through each internship ID in the provided list
        for (let internshipId of internshipIds) {
            try {
                const internship = await Internship.findById(internshipId);
                if (!internship) {
                    failures.push({ internshipId, message: 'Internship not found.' });
                    continue;
                }

                // Check if the internship already has an assigned teacher
                if (internship.teacher && !forceReplace) {
                    failures.push({ internshipId, message: 'This internship already has an assigned teacher. Use "forceReplace" to overwrite.' });
                    continue;
                }

                // Assign the teacher to the internship
                internship.teacher = teacherId;

                // If forceReplace is true, replace the existing topic with the new teacher's topic (if applicable)
                if (forceReplace && internship.topic) {
                    internship.topic = { ...internship.topic, teacher: teacherId }; // Example of replacing or updating the topic
                }

                await internship.save();

                // Add the internship to the teacher's assignedInternships array
                teacher.assignedInternships.push(internshipId);
                await teacher.save();

                success.push({ internshipId, message: 'Teacher successfully assigned to internship.' });
            } catch (error) {
                failures.push({ internshipId, message: `Error assigning teacher to internship: ${error.message}` });
            }
        }

        // Respond with a summary of the operation
        res.status(200).json({
            message: 'Teacher assignment completed.',
            success,
            failures,
        });
    } catch (error) {
        console.error('Error assigning teacher to internships:', error.message);
        res.status(500).json({ error: 'Failed to assign teacher to internships.' });
    }
};

// assign Teacher to Topics automatically
export const assignTeachersToInternships = async (req, res) => {
    const { teacherIds } = req.body;

    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
        return res.status(400).json({ message: "Teacher IDs must be provided." });
    }

    // Filter out any empty strings from the teacherIds list
    const validTeacherIds = teacherIds.filter((id) => id.trim() !== "");

    if (validTeacherIds.length <= 0) {
        return res.status(400).json({ message: "Teacher IDs not valid" });
    }

    try {
        // Step 1: Fetch eligible teachers based on provided teacher IDs
        const teachers = await Teacher.find({ _id: { $in: validTeacherIds }, })
            .populate("assignedInternships", "title")
            .sort({ subjectCount: -1 });

        if (teachers.length === 0) {
            return res.status(404).json({ message: "No valid teachers found with the provided IDs." });
        }

        // Step 2: Fetch all internships without an assigned teacher
        const internships = await Internship.find({ teacher: null, isArchived: false });

        if (internships.length === 0) {
            return res.status(404).json({ message: "No unassigned internships available." });
        }

        // Step 3: Calculate the total number of internships
        const totalInternships = internships.length;

        // Step 4: Calculate how many internships each teacher should receive
        const internshipsPerTeacher = Math.floor(totalInternships / teachers.length);
        const remainingInternships = totalInternships % teachers.length; // Handle any remainder

        let internshipIndex = 0;
        const results = []; // To store assignment details

        // Step 5: Assign internships to teachers
        for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];

            // Determine the number of internships this teacher will receive
            const internshipsToAssign = internshipsPerTeacher + (i < remainingInternships ? 1 : 0);
            const assignedInternships = [];

            for (let j = 0; j < internshipsToAssign && internshipIndex < totalInternships; j++) {
                const internship = internships[internshipIndex];

                // Assign the teacher to the internship
                internship.teacher = teacher._id;
                await internship.save();

                // Add the internship to the teacher's list
                teacher.assignedInternships.push(internship._id);
                assignedInternships.push({
                    id: internship._id,
                    title: internship.title,
                    StartDate: internship.StartDate,
                    EndDate: internship.EndDate,
                });

                internshipIndex++;
            }

            // Save the teacher with updated internships
            if (assignedInternships.length > 0) {
                await teacher.save();
                results.push({
                    teacher: {
                        id: teacher._id,
                        name: `${teacher.firstName} ${teacher.lastName}`,
                        subjectCount: teacher.subjectCount,
                    },
                    assignedInternships,
                });
            }

            // Stop assigning if all internships are assigned
            if (internshipIndex >= totalInternships) break;
        }

        // Step 6: Return the results with a meaningful message
        if (results.length === 0) {
            return res.status(200).json({ message: "No internships were assigned due to teacher availability." });
        }

        const totalAssigned = results.reduce((acc, curr) => acc + curr.assignedInternships.length, 0);
        res.status(200).json({
            message: `${results.length} teachers successfully assigned a total of ${totalAssigned} internships.`,
            results,
        });
    } catch (error) {
        console.error("Error assigning internships to teachers:", error.message);
        res.status(500).json({ error: "Failed to assign internships to teachers.", details: error.message });
    }
};


// JUST FOR DEVELOPMENT USE ONLY
export const removeAllAssignedInternships = async (req, res) => {
    try {
        // Step 1: Fetch all teachers
        const teachers = await Teacher.find();

        // Step 2: Remove all assigned internships from teachers
        for (const teacher of teachers) {
            teacher.assignedInternships = []; // Clear the assignedInternships array
            await teacher.save(); // Save the teacher document
        }

        // Step 3: Fetch all internships and set their teacher field to null
        const internships = await Internship.find({ isArchived: false });

        for (const internship of internships) {
            internship.teacher = null; // Remove the teacher reference
            if (!internship.documents) internship.documents = {};
            await internship.save(); // Save the internship document
        }

        res.status(200).json({ message: 'All assigned internships cleared for teachers and updated in internships.' });
    } catch (error) {
        console.error('Error removing assigned internships:', error.message);
        res.status(500).json({ error: 'Failed to remove assigned internships.' });
    }
};

// FOR TEACHER : get internships assigned to a specific teacher
export const getAssignedInternships = async (req, res) => {
    const { page = 1, limit = 5, isValid, day, nomSociete } = req.query;
    const teacherId = req.user.idRole;  // Extract teacherId from the JWT token

    // Convert page and limit to integers and ensure valid values
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 5;

    // Build the filter object dynamically
    let filter = { teacher: teacherId, isArchived: false }; // Default filter for the teacher and non-archived internships
    if (isValid !== undefined) filter.isValid = isValid === 'true'; // Convert isValid to boolean
    if (day) filter.day = new Date(day); // Filter by day, assuming day is a valid date string
    if (nomSociete) filter.nomSociete = new RegExp(nomSociete, 'i'); // Case-insensitive search for nomSociete

    try {
        // Fetch internships assigned to the teacher with filters, pagination, and population
        const internships = await Internship.find(filter)
            .populate({
                path: 'student', // Populate student details
                select: 'firstName lastName user', // Select student name and user details
                populate: {
                    path: 'user', // Populate user to fetch email
                    select: 'email', // Select only email from user
                },
            })
            .populate({
                path: "planning", // Populate
                select: "horaire day meet_link",
            })
            .select("-teacher")  // Exclude the teacher field from the result
            .skip((currentPage - 1) * currentLimit) // Skip results for pagination
            .limit(currentLimit) // Limit the results per page
            .exec();

        // Fetch the total count of internships
        const total = await Internship.countDocuments(filter);

        // If no internships are found for the teacher
        if (internships.length === 0) {
            return res.status(404).json({ message: 'No internships assigned to this teacher.' });
        }

        // Return the internships with pagination data
        res.status(200).json({
            message: 'Internships assigned to You :',
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: internships,
        });
    } catch (error) {
        console.error('Error fetching assigned internships:', error.message);

        // Handle specific errors such as invalid or expired token
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        // General server error response
        res.status(500).json({ message: 'Error fetching assigned internships.', error: error.message });
    }
};

// teacher validate internship
export const validateInternship = async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.idRole;  // Assuming the teacherId is decoded from the JWT token
    const { isValid, reasonIfNotValid } = req.body;

    try {
        // Find the internship by ID and populate teacher details
        const internship = await Internship.findById(id).populate('teacher');

        // Check if the internship exists
        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        // Validate that the internship has a teacher assigned
        if (!internship.teacher) {
            return res.status(400).json({ message: "Ce stage n'a pas d'enseignant assigné." });
        }

        // Check if the teacherId from the token matches the teacher assigned to the internship
        if (internship.teacher._id.toString() !== teacherId) {
            return res.status(403).json({ message: "L'enseignant ne correspond pas." });
        }

        // Validate the 'isValid' field: it should be a boolean
        if (typeof isValid !== 'boolean') {
            return res.status(400).json({ message: "Le champ 'isValid' doit être un booléen." });
        }

        // If 'isValid' is false, ensure that the 'reasonIfNotValid' field is provided
        if (!isValid && !reasonIfNotValid) {
            return res.status(400).json({ message: "Le champ 'reasonIfNotValid' est obligatoire lorsque 'isValid' est faux." });
        }

        // Update the internship's 'reasonIfNotValid' field if provided
        if (reasonIfNotValid) {
            internship.reasonIfNotValid = reasonIfNotValid;
        }

        // Update the 'isValid' field of the internship
        internship.isValid = isValid;

        // Save the updated internship
        const updatedInternship = await internship.save();

        // Send the updated internship in the response
        res.status(200).json({
            message: 'Stage mis à jour avec succès.',
            updatedInternship,
        });

    } catch (error) {
        // Log error details for debugging
        console.error("Error updating internship:", error.message);

        // Return a generic server error
        res.status(500).json({
            message: "Erreur lors de la mise à jour du stage.",
            error: error.message,
        });
    }
};

// Get internships for a specific student by Token
export const getInternshipByStudentToken = async (req, res) => {
    const { page = 1, limit = 5, isValid, Type, teacherId, day, nomSociete } = req.query;
    const studentId = req.user.idRole; // Extract student ID from JWT token

    // Validate query parameters for pagination
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 5;

    // Build the filter object
    let filter = { student: studentId, isArchived: false }; // Include filter for the student ID and isArchived
    if (isValid !== undefined) filter.isValid = isValid === 'true'; // Convert isValid to boolean
    if (Type) filter.Type = Type; // Filter by Type if provided
    if (teacherId) filter.teacher = teacherId; // Filter by teacherId if provided
    if (nomSociete) filter.nomSociete = nomSociete; // Filter by nomSociete if provided
    if (day) filter.day = new Date(day); // Filter by day, assuming day is a valid date string

    try {
        // Fetch internships assigned to the student with pagination
        const internships = await Internship.find(filter)
            .select('-student -isArchived -isValid -reasonIfNotValid') // Exclude  from
            .populate({
                path: 'teacher',
                select: 'firstName lastName', // Populate teacher's first name and last name
                populate: {
                    path: 'user',
                    select: 'email', // Populate teacher's email from the User model
                },
            })
            .populate({
                path: "planning", // Populate
                select: "horaire day meet_link",
            })
            .skip((currentPage - 1) * currentLimit) // Skip the appropriate number of results based on the page
            .limit(currentLimit) // Limit the number of results to the specified limit
            .exec();

        // Handle the case where no internships are found
        if (!internships || internships.length === 0) {
            return res.status(404).json({ message: "Aucun stage trouvé pour cet étudiant." });
        }

        // Fetch total count of internships
        const total = await Internship.countDocuments(filter);

        // Respond with the fetched internships and pagination data
        res.status(200).json({
            message: 'List of your Internships',
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: internships,
        });
    } catch (error) {
        console.error("Error fetching internships for student:", error.message);

        // Return a descriptive error response
        res.status(500).json({
            message: "Une erreur est survenue lors de la récupération des stages.",
            error: error.message,
        });
    }
};

// Fetch internships for a student for PV
export const getInternshipByStudentForPV = async (req, res) => {
    const { page = 1, limit = 5, isValid, Type, teacherId, day, nomSociete } = req.query;
    const studentId = req.user.idRole; // Extract student ID from JWT token

    // Parse and validate pagination values
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 5;

    // Build the filter object dynamically
    const filter = { student: studentId, isArchived: false, isValid: { $ne: null } };

    if (isValid !== undefined) filter.isValid = isValid === 'true'; // Ensure isValid is a boolean
    if (Type) filter.Type = Type;
    if (teacherId) filter.teacher = teacherId;
    if (nomSociete) filter.nomSociete = nomSociete;
    if (day) filter.day = new Date(day);

    try {
        // Fetch internships with pagination and populate relevant fields
        const internships = await Internship.find(filter)
            .select('-_id -student -isArchived -documents -topic -planning')
            .skip((currentPage - 1) * currentLimit)
            .limit(currentLimit)
            .populate({
                path: 'teacher',
                select: 'firstName lastName',
                populate: {
                    path: 'user',
                    select: 'email', // Populate email of teacher
                },
            })
            .exec();

        // If no internships are found, return a 404 response
        if (!internships.length) {
            return res.status(404).json({ message: 'Aucun stage trouvé pour cet étudiant.' });
        }

        // Fetch the total count of internships to calculate pagination info
        const total = await Internship.countDocuments(filter);

        // Return the internships and pagination data
        res.status(200).json({
            message: 'PV of Internships',
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: internships,
        });
    } catch (error) {
        console.error('Error fetching internships for student:', error.message);

        // Handle unexpected errors with a generic message
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération des stages.',
            error: error.message,
        });
    }
};
