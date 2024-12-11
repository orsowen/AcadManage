import DepositPeriod from '../models/DepositPeriod.js';
import Internship from '../models/Internship.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teachers.js';

const validateFiles = (documents) => {
    const fileValidation = /\.(pdf|docx)$/i; // Regular expression for validating .pdf or .docx files
    const { attestation, rapport, ficheEval } = documents;

    // Check if each file follows the allowed extension
    if (!fileValidation.test(attestation) || !fileValidation.test(rapport) || !fileValidation.test(ficheEval)) {
        return {
            isValid: false,
            message: "Invalid file format. Only PDF or DOCX files are allowed for attestation, rapport, and ficheEval.",
        };
    }

    return { isValid: true }; // All files are valid
};

// Add a new internship
export const addInternship = async (req, res) => {
    // const { title, documents, StartDate, EndDate, typeInternship, studentId, teacherId, topicDetails } = req.body;
    const { title, documents, StartDate, EndDate, typeInternship, nomSociete, teacherId, topicDetails } = req.body;
    const studentId = req.user.idRole; // Extract student ID from JWT token

    // Validate dates (StartDate should be before EndDate)
    if (new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        if (studentId || req.user.role == "student") {
            // Check if the current period allows STAGE deposits
            const currentPeriod = await DepositPeriod.findOne({
                For: "STAGE",
                Start_Deposit: { $lte: new Date() },
                End_Deposit: { $gte: new Date() }
            });
            if (!currentPeriod) {
                return res.status(403).json({
                    error: "Internships can only be created during the deposit period."
                });
            }
        }
        // CREATE 
        // Validate topicDetails input
        if (!topicDetails || !topicDetails.title || !topicDetails.description || !topicDetails.techList) {
            return res.status(400).json({ error: "Les détails du sujet (topicDetails) sont incomplets." });
        }

        // Validate documents input
        if (!documents || !documents.ficheEval || !documents.attestation || !documents.rapport) {
            return res.status(400).json({ error: "Les docs du stage (documents) sont incomplets." });
        }

        // Validate file formats using the validateFiles function
        const fileValidation = validateFiles(documents);
        if (!fileValidation.isValid) {
            return res.status(400).json({ error: fileValidation.message });
        }

        // Validate the student (if provided)
        let student = null;
        if (studentId) {
            student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
            }
        }

        // Validate the teacher (if provided)
        let teacher = null;
        if (teacherId) {
            teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
            }
            // Ensure teacher is not assigned to the maximum number of internships
            if (teacher.subjectCount <= teacher.assignedInternships.length) {
                return res.status(400).json({ error: `Teacher ${teacher.firstName} ${teacher.lastName} has no available slots.` });
            }
        }
        // Create the internship object with the provided topic and student/teacher if available
        const newInternship = new Internship({
            title,
            documents,
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
        });

        // Save the internship
        const savedInternship = await newInternship.save();

        // If a teacher is associated, add the internship to the teacher's list of assigned internships
        if (teacher) {
            teacher.assignedInternships.push(savedInternship._id);
            await teacher.save();
        }

        // Respond with the created internship details
        res.status(201).json({ message: "Internship created successfully.", savedInternship });

    } catch (error) {
        // Handle and log unexpected errors
        console.error("Error adding internship:", error.message);
        res.status(500).json({ error: "Erreur lors de l'ajout du stage.", error });
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
            .exec();

        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable." });
        }

        res.status(200).json(internship);
    } catch (error) {
        console.error("Error fetching internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération du stage." });
    }
};

// Update an internship and its associated topic (if true update only the documents)
export const updateInternship = (onlyDocument = false) => async (req, res) => {
    const studentId = req.user.idRole; // Extract student ID from JWT token
    const role = req.user.role; // Extract role from JWT token
    const { id } = req.params;
    const { title, documents, StartDate, EndDate, topicDetails, nomSociete } = req.body;

    // Validate date range if provided
    if (StartDate && EndDate && new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Ensure it's within the allowed period for internship updates (if student)
        if (role === "student") {
            const currentPeriod = await DepositPeriod.findOne({
                For: "STAGE",
                Start_Deposit: { $lte: new Date() },
                End_Deposit: { $gte: new Date() }
            });
            if (!currentPeriod) {
                return res.status(403).json({
                    error: "Les stages peuvent uniquement être mis à jour pendant la période de dépôt."
                });
            }
        }

        // Fetch the internship for updating
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        // Ensure the user is authorized to update the internship (student or admin)
        if (internship.student._id.toString() !== studentId && role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Handle document update (ficheEval, attestation, rapport)
        if (documents) {
            const { ficheEval, attestation, rapport } = documents;

            // Check if the necessary documents are provided
            if (!ficheEval || !attestation || !rapport) {
                return res.status(400).json({ error: "Les documents du stage sont incomplets." });
            }

            // Validate file formats using the validateFiles function
            const fileValidation = validateFiles(documents);
            if (!fileValidation.isValid) {
                return res.status(400).json({ error: fileValidation.message });
            }

            // Update internship documents
            internship.documents.ficheEval = ficheEval;
            internship.documents.attestation = attestation;
            internship.documents.rapport = rapport;
        }

        // Update other fields (topic, title, dates, etc.) if not only updating documents
        if (!onlyDocument) {
            // Ensure topic details are provided
            if (topicDetails) {
                const { title, description, techList } = topicDetails;

                if (!title || !description || !techList) {
                    return res.status(400).json({ error: "Les détails du sujet sont incomplets." });
                }

                internship.topic.title = title;
                internship.topic.description = description;
                internship.topic.techList = techList;
            }

            // Update the rest of the fields (title, dates, etc.)
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
        const { internshipId, teacherId } = req.body;

        // Fetch the internship and teacher
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found.' });
        }

        // Check if the internship already has an assigned teacher
        if (internship.teacher) {
            return res.status(400).json({ message: 'This internship already has an assigned teacher.' });
        }

        // const teacher = await Teacher.findOne({
        //     _id: teacherId,
        //     // $expr: { $gt: [{ $size: "$assignedInternships" }, "$subjectCount"] },
        // })
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        if (teacher.subjectCount <= teacher.assignedInternships.length) {
            return res.status(400).json({ message: 'Teacher assignment is full.' });
        }

        // Assign the teacher to the internship
        internship.teacher = teacherId;
        await internship.save();

        // Add the internship to the teacher's assignedInternships array
        teacher.assignedInternships.push(internshipId);
        await teacher.save();

        res.status(200).json({ message: 'Teacher successfully assigned to internship.', teacher, internship });
    } catch (error) {
        console.error('Error assigning teacher to internship:', error.message);
        res.status(500).json({ error: 'Failed to assign teacher to internship.' });
    }
};

// assign Teacher to Topics automatically
export const assignTeachersToInternships = async (req, res) => {
    const { teacherIds } = req.body; // Optional list of teacher IDs from the request body

    try {
        // Step 1: Fetch the teachers - filter based on provided IDs or all eligible teachers
        let teachers;
        if (teacherIds && teacherIds.length > 0) {
            teachers = await Teacher.find({
                _id: { $in: teacherIds },
                $or: [
                    { assignedInternships: { $size: 0 } }, // Teachers with no assigned internships
                    { $expr: { $lt: [{ $size: { $ifNull: ["$assignedInternships", []] } }, "$subjectCount"] } }, // Teachers with fewer assignments than their subject count
                ],
            });
        } else {
            teachers = await Teacher.find({
                $or: [
                    { assignedInternships: { $size: 0 } }, // Teachers with no assigned internships
                    { $expr: { $lt: [{ $size: { $ifNull: ["$assignedInternships", []] } }, "$subjectCount"] } }, // Teachers with fewer assignments than their subject count
                ],
            });
        }

        // Step 2: Fetch all internships with no assigned teacher
        const internships = await Internship.find({ teacher: null });

        // If there are no teachers or internships to assign, respond with an error
        if (teachers.length === 0 || internships.length === 0) {
            return res.status(400).json({ message: 'No teachers or unassigned internships available.' });
        }

        // Step 3: Calculate total available subjects and internships
        const totalSubjects = teachers.reduce((sum, teacher) => sum + teacher.subjectCount, 0);
        const totalInternships = internships.length;

        if (totalSubjects === 0 || totalInternships === 0) {
            return res.status(400).json({ message: 'No available subjects or internships to assign.' });
        }

        // Step 4: Calculate internships per subject ratio
        const internshipsPerSubject = totalInternships / totalSubjects;
        console.log("internshipsPerSubject :", internshipsPerSubject);

        // Step 5: Assign internships to teachers and collect results
        let internshipIndex = 0;
        const results = []; // To store assignment details

        for (const teacher of teachers) {
            // Calculate the number of internships to assign based on the ratio
            const maxAssignable = Math.floor((teacher.subjectCount - teacher.assignedInternships.length) * internshipsPerSubject);
            const assignableCount = Math.min(maxAssignable, totalInternships - internshipIndex);

            const assignedInternships = [];
            for (let i = 0; i < assignableCount && internshipIndex < totalInternships; i++) {
                const internship = internships[internshipIndex];

                // Assign the teacher to the internship
                internship.teacher = teacher._id;
                await internship.save();

                // Add the internship to the teacher's assignedInternships array
                teacher.assignedInternships.push(internship._id);

                // Collect assigned internship details
                assignedInternships.push({
                    id: internship._id,
                    title: internship.title,
                    StartDate: internship.StartDate,
                    EndDate: internship.EndDate,
                });

                internshipIndex++;
            }

            // Save teacher with updated assignedInternships
            await teacher.save();

            // Add assignment details to the results array
            results.push({
                teacher: {
                    id: teacher._id,
                    name: `${teacher.firstName} ${teacher.lastName}`,
                    subjectCount: teacher.subjectCount,
                },
                assignedInternships,
            });

            // Stop assigning if all internships are assigned
            if (internshipIndex >= totalInternships) break;
        }

        // Return the results in JSON format
        res.status(200).json({ message: 'Internships successfully assigned to teachers.', results });
    } catch (error) {
        console.error('Error assigning internships to teachers:', error.message);
        res.status(500).json({ error: 'Failed to assign internships to teachers.' });
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
        const internships = await Internship.find();

        for (const internship of internships) {
            internship.teacher = null; // Remove the teacher reference
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
    const currentPage = Math.max(parseInt(page, 10), 1);
    const currentLimit = Math.max(parseInt(limit, 10), 5);

    // Build the filter object dynamically
    const filter = { student: studentId, isArchived: false };

    if (isValid !== undefined) filter.isValid = isValid === 'true'; // Ensure isValid is a boolean
    if (Type) filter.Type = Type;
    if (teacherId) filter.teacher = teacherId;
    if (nomSociete) filter.nomSociete = nomSociete;
    if (day) filter.day = new Date(day);

    try {
        // Fetch internships with pagination and populate relevant fields
        const internships = await Internship.find(filter)
            .select('-_id -student -isArchived -documents -topic')
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
