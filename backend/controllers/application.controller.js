import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id; // Assuming req.id comes from a previous middleware
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            });
        }

        // Check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job.",
                success: false
            });
        }

        // Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        // Add the application to the job's application list
        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while applying for the job.",
            success: false
        });
    }
};

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'company',
                    options: { sort: { createdAt: -1 } },
                }
            });

        if (applications.length === 0) {
            return res.status(404).json({
                message: "No applications found.",
                success: false
            });
        }

        return res.status(200).json({
            applications,
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching applied jobs.",
            success: false
        });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching applicants.",
            success: false
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: 'Status is required.',
                success: false
            });
        }

        // Find the application by application ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // Update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while updating the status.",
            success: false
        });
    }
};