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
    // const { title, documents, StartDate, EndDate, isValid, typeInternship, studentId, teacherId, topicDetails } = req.body;
    const { title, documents, StartDate, EndDate, typeInternship, studentId, teacherId, topicDetails } = req.body;

    // Validate dates
    if (new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Validate `topicDetails` input
        if (!topicDetails || !topicDetails.title || !topicDetails.description || !topicDetails.techList) {
            return res.status(400).json({ error: "Les détails du sujet (topicDetails) sont incomplets." });
        }
        // Validate `documents` input
        if (!documents || !documents.ficheEval || !documents.attestation || !documents.rapport) {
            return res.status(400).json({ error: "Les docs du stage (documents) sont incomplets." });
        }
        // Validate the file formats using the validateFiles function
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
        }
        if (teacher != null && teacher.subjectCount >= teacher.assignedInternships.length) {
            return res.status(400).json({ error: `Teacher ${teacher.firstName} is Full.` });
        }

        // Create the internship with the embedded topic
        const newInternship = new Internship({
            title,
            documents,
            StartDate,
            EndDate,
            // isValid,
            typeInternship,
            topic: {
                title: topicDetails.title,
                description: topicDetails.description,
                techList: topicDetails.techList,
            },
            student: studentId || null,
            teacher: teacherId || null,
        });

        const savedInternship = await newInternship.save();
        if (teacher) {
            // Add the internship to the teacher's assignedInternships array
            teacher.assignedInternships.push(savedInternship._id);
            await teacher.save();
        }
        res.status(201).json({ message: "Internship created successfully", savedInternship });
    } catch (error) {
        console.error("Error adding internship:", error.message);
        res.status(500).json({ error: "Erreur lors de l'ajout du stage.", error });
    }
};

export const getAllInternships = async (req, res) => {
    const { page = 1, limit = 5, isValid, Type, studentId, teacherId, day } = req.query;

    // Build the filter object
    let filter = {};
    if (isValid !== undefined) filter.isValid = isValid === 'true';
    if (Type) filter.Type = Type;
    if (studentId) filter.student = studentId;
    if (teacherId) filter.teacher = teacherId;
    if (day) filter.day = new Date(day);

    try {
        // Fetch internships with filters, pagination, and population
        const internships = await Internship.find(filter)
            .populate('student', 'firstName lastName email')
            .populate('teacher', 'firstName lastName email')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Fetch total count of internships
        const total = await Internship.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: internships,
        });
    } catch (error) {
        console.error("Error fetching internships:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération des stages." });
    }
};

// Get a specific internship by ID
export const getInternshipById = async (req, res) => {
    const { id } = req.params;

    try {
        const internship = await Internship.findById(id)
            .populate('student', 'firstName lastName email') // Populate student details
            .populate('teacher', 'firstName lastName email'); // Populate teacher details

        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable." });
        }

        res.status(200).json(internship);
    } catch (error) {
        console.error("Error fetching internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération du stage." });
    }
};

// Update an internship
// Update an internship and its associated topic
export const updateInternship = async (req, res) => {
    const { id } = req.params;
    // const { title, documents, StartDate, EndDate, isValid, topicDetails, studentId, teacherId } = req.body;
    // const { title, documents, StartDate, EndDate, topicDetails, studentId, teacherId } = req.body;
    const { title, documents, StartDate, EndDate, topicDetails, studentId } = req.body;

    // Validate dates
    if (StartDate && EndDate && new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }



        // Update topic details if provided
        if (topicDetails) {
            if (!topicDetails.title || !topicDetails.description || !topicDetails.techList) {
                return res.status(400).json({ error: "Les détails du sujet (topicDetails) sont incomplets." });
            }
            internship.topic.title = topicDetails.title;
            internship.topic.description = topicDetails.description;
            internship.topic.techList = topicDetails.techList;
        }
        if (documents) {
            if (!documents || !documents.ficheEval || !documents.attestation || !documents.rapport) {
                return res.status(400).json({ error: "Les docs du stage (documents) sont incomplets." });
            }
            // Validate the file formats using the validateFiles function
            const fileValidation = validateFiles(documents);
            if (!fileValidation.isValid) {
                return res.status(400).json({ error: fileValidation.message });
            }
            internship.documents.ficheEval = documents.ficheEval;
            internship.documents.attestation = documents.attestation;
            internship.documents.rapport = documents.rapport;
        }
        // Update other fields
        if (title) internship.title = title;
        if (StartDate) internship.StartDate = StartDate;
        if (EndDate) internship.EndDate = EndDate;
        // if (isValid !== undefined) internship.isValid = isValid;

        // Validate and update student
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
            }
            internship.student = studentId;
        }

        // Validate and update teacher
        // if (teacherId) {
        //     const teacher = await Teacher.findById(teacherId);
        //     if (!teacher) {
        //         return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
        //     }
        //     internship.teacher = teacherId;
        // }

        const updatedInternship = await internship.save();
        res.status(200).json(updatedInternship);
    } catch (error) {
        console.error("Error updating internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour du stage." });
    }
};


// Delete an internship by ID
export const deleteInternship = async (req, res) => {
    const { id } = req.params;

    try {
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



// MANUAL ADDING
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

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        if (teacher.subjectCount === teacher.assignedInternships.length) {
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

export const getAssignedInternships = async (req, res) => {
    // need to be updated later with token
    const { teacherId } = req.body;  // Teacher ID from the request body
    // console.log(teacherId);

    try {
        // Validate teacher existence
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        // Fetch internships assigned to this teacher
        const internships = await Internship.find({ teacher: teacherId })
            .populate('student', 'firstName lastName email')  // Populate student details
            .populate('topic', 'title description')  // Populate topic details
            .select('-teacher')  // Exclude the 'teacher' field from the result
            .exec();

        // If no internships are found for the teacher
        if (internships.length === 0) {
            return res.status(404).json({ message: 'No internships assigned to this teacher.' });
        }

        // Return the internships
        res.status(200).json({
            message: 'Internships fetched successfully.',
            data: internships,
        });
    } catch (error) {
        console.error('Error fetching assigned internships:', error.message);
        res.status(500).json({ message: 'Error fetching assigned internships.', error });
    }
};


// 
export const validateInternship = async (req, res) => {
    const { id } = req.params;
    const { isValid, teacherId, reasonIfNotValid } = req.body;

    try {
        // Find the internship by ID and populate teacher details
        const internship = await Internship.findById(id).populate('teacher');

        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        // Check if the internship has an assigned teacher
        if (!internship.teacher) {
            return res.status(404).json({ message: "Vous n'etes pas assigné à ce stage." });
        }

        // Check if the teacherId in the request matches the teacher assigned to the internship
        if (internship.teacher._id.toString() !== teacherId) {
            return res.status(403).json({ message: "L'enseignant ne correspond pas." });
        }

        // Check if isValid is a boolean
        if (typeof isValid !== 'boolean') {
            return res.status(400).json({ message: "Le champ 'isValid' doit être un booléen." });
        }
        if (!isValid && !reasonIfNotValid) {
            return res.status(400).json({ message: "Le champ 'reasonIfNotValid' est Obligatoire." });
        }

        if (reasonIfNotValid) internship.reasonIfNotValid = reasonIfNotValid;

        // Update the internship's isValid field
        internship.isValid = isValid;
        const updatedInternship = await internship.save();
        // Send the updated internship as the response
        res.status(200).json(updatedInternship);
    } catch (error) {
        console.error("Error updating internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour du stage." });
    }
};
