import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Register a new company
export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        // Check if company already exists
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "This company is already registered.",
                success: false
            });
        }

        // Create a new company
        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while registering the company.",
            success: false
        });
    }
};

// Fetch all companies for the logged-in user
export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });

        if (companies.length === 0) {
            return res.status(404).json({
                message: "No companies found.",
                success: false
            });
        }

        return res.status(200).json({
            companies,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching companies.",
            success: false
        });
    }
};

// Fetch company by ID
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            company,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching the company.",
            success: false
        });
    }
};

// Update company information
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        if (!name || !description || !website || !location) {
            return res.status(400).json({
                message: "All fields (name, description, website, location) are required.",
                success: false
            });
        }

        const updateData = { name, description, website, location };

        // Handle file upload if present
        if (req.file) {
            try {
                const fileUri = getDataUri(req.file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                updateData.logo = cloudResponse.secure_url; // update logo URL if file is uploaded
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({
                    message: "An error occurred while uploading the logo image.",
                    success: false
                });
            }
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company information updated successfully.",
            success: true,
            company  // Return updated company data
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while updating the company.",
            success: false
        });
    }
};