import Internship from '../models/Internship.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teachers.js';
import Topic from '../models/Topic.js';

// Add a new internship
export const addInternship = async (req, res) => {
    const { title, documents, StartDate, EndDate, isValid, studentId, teacherId, topicDetails } = req.body;

    // Validate dates
    if (new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Validate `topicDetails` input
        if (!topicDetails || !topicDetails.title || !topicDetails.description || !topicDetails.techList) {
            return res.status(400).json({ error: "Les détails du sujet (topicDetails) sont incomplets." });
        }

        // Validate teacher for the topic (if provided)
        if (topicDetails.teacher) {
            const teacherExists = await Teacher.findById(topicDetails.teacher);
            if (!teacherExists) {
                return res.status(404).json({ error: "L'enseignant spécifié pour le sujet n'existe pas." });
            }
        }

        // Create a new topic
        const newTopic = new Topic({
            title: topicDetails.title,
            description: topicDetails.description,
            techList: topicDetails.techList,
            teacher: topicDetails.teacher || null,
        });
        const createdTopic = await newTopic.save();

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

        // Create the internship using the created topic
        const newInternship = new Internship({
            title,
            documents,
            StartDate,
            EndDate,
            isValid,
            topic: createdTopic._id, // Use the newly created topic ID
            student: studentId || null,
            teacher: teacherId || null,
        });

        const savedInternship = await newInternship.save();
        res.status(201).json({ message: "Internship created successfully", savedInternship });
    } catch (error) {
        console.error("Error adding internship:", error.message);
        res.status(500).json({ error: "Erreur lors de l'ajout du stage." });
    }
};
// OLD VERSION
// export const addInternship = async (req, res) => {
//     const { title, documents, StartDate, EndDate, isValid, topicId, studentId, teacherId } = req.body;

//     // Validate dates
//     if (new Date(StartDate) > new Date(EndDate)) {
//         return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
//     }

//     try {
//         // Check if the topic exists
//         const topic = await Topic.findById(topicId);
//         if (!topic) {
//             return res.status(404).json({ error: "Le topic associé n'existe pas." });
//         }

//         // Check if the student exists (if provided)
//         let student = null;
//         if (studentId) {
//             student = await Student.findById(studentId);
//             if (!student) {
//                 return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
//             }
//         }

//         // Check if the teacher exists (if provided)
//         let teacher = null;
//         if (teacherId) {
//             teacher = await Teacher.findById(teacherId);
//             if (!teacher) {
//                 return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
//             }
//         }

//         // Create the internship
//         const newInternship = new Internship({
//             title,
//             documents,
//             StartDate,
//             EndDate,
//             isValid,
//             topic: topicId,
//             student: studentId || null,
//             teacher: teacherId || null,
//         });

//         const savedInternship = await newInternship.save();
//         res.status(201).json(savedInternship);
//     } catch (error) {
//         console.error("Error adding internship:", error.message);
//         res.status(500).json({ error: "Erreur lors de l'ajout du stage." });
//     }
// };

export const getAllInternships = async (req, res) => {
    const { page = 1, limit = 5, isValid, Type, studentId, teacherId, day } = req.query; // Default to page 1 and 5 results per page
    // Build the filter object
    let filter = {};
    if (isValid !== undefined) filter.isValid = isValid === 'true';
    if (Type) filter.Type = Type;
    if (studentId) filter.student = studentId; // Filter by student
    if (teacherId) filter.teacher = teacherId; // Filter by teacher
    if (day) filter.day = new Date(day); // Filter by specific day

    try {
        // Fetch internships with pagination
        const internships = await Internship.find(filter)
            .populate('topic', 'title techList')
            .populate('student', 'firstName lastName email')
            .populate('teacher', 'firstName lastName email')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Fetch total count of internships
        const total = await Internship.countDocuments();

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
            .populate('topic', 'title techList') // Populate topic title
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
    const { id } = req.params; // Internship ID
    const { title, documents, StartDate, EndDate, isValid, topicDetails, studentId, teacherId } = req.body;

    // Validate dates
    if (StartDate && EndDate && new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    try {
        // Fetch the internship to get the associated topic ID
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        const topicId = internship.topic; // Extract topic ID from the internship

        // Update topic details if `topicDetails` is provided
        if (topicDetails) {
            const { title: topicTitle, description, techList, teacher } = topicDetails;

            // Validate teacher for the topic if specified
            if (teacher) {
                const teacherExists = await Teacher.findById(teacher);
                if (!teacherExists) {
                    return res.status(404).json({ error: "L'enseignant spécifié pour le sujet n'existe pas." });
                }
            }

            // Update the topic
            const updatedTopic = await Topic.findByIdAndUpdate(
                topicId,
                { title: topicTitle, description, techList, teacher },
                { new: true, runValidators: true }
            );

            if (!updatedTopic) {
                return res.status(404).json({ error: "Sujet introuvable pour la mise à jour." });
            }
        }

        // Validate the student (if provided)
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
            }
        }

        // Validate the teacher (if provided)
        if (teacherId) {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
            }
        }

        // Update the internship
        const updatedInternship = await Internship.findByIdAndUpdate(
            id,
            {
                title,
                documents,
                StartDate,
                EndDate,
                isValid,
                student: studentId,
                teacher: teacherId,
            },
            { new: true, runValidators: true }
        );

        if (!updatedInternship) {
            return res.status(404).json({ message: "Stage introuvable pour la mise à jour." });
        }

        res.status(200).json(updatedInternship);
    } catch (error) {
        console.error("Error updating internship:", error.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour du stage." });
    }
};

// export const updateInternship = async (req, res) => {
//     const { id } = req.params;
//     const { title, documents, StartDate, EndDate, isValid, topicId, studentId, teacherId } = req.body;

//     // Validate dates
//     if (StartDate && EndDate && new Date(StartDate) > new Date(EndDate)) {
//         return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
//     }

//     try {
//         // Check if the topic exists (if provided)
//         if (topicId) {
//             const topic = await Topic.findById(topicId);
//             if (!topic) {
//                 return res.status(404).json({ error: "Le topic associé n'existe pas." });
//             }
//         }

//         // Check if the student exists (if provided)
//         if (studentId) {
//             const student = await Student.findById(studentId);
//             if (!student) {
//                 return res.status(404).json({ error: "L'étudiant associé n'existe pas." });
//             }
//         }

//         // Check if the teacher exists (if provided)
//         if (teacherId) {
//             const teacher = await Teacher.findById(teacherId);
//             if (!teacher) {
//                 return res.status(404).json({ error: "L'enseignant associé n'existe pas." });
//             }
//         }

//         // Update the internship
//         const updatedInternship = await Internship.findByIdAndUpdate(
//             id,
//             { title, documents, StartDate, EndDate, isValid, topic: topicId, student: studentId, teacher: teacherId },
//             { new: true, runValidators: true }
//         );

//         if (!updatedInternship) {
//             return res.status(404).json({ message: "Stage introuvable." });
//         }

//         res.status(200).json(updatedInternship);
//     } catch (error) {
//         console.error("Error updating internship:", error.message);
//         res.status(500).json({ error: "Erreur lors de la mise à jour du stage." });
//     }
// };

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
