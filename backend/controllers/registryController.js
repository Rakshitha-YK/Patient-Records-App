// backend/controllers/registryController.js

// This represents the central database of all doctors in India
const NATIONAL_DOCTOR_DB = [
    { nmcId: 'NMC12345', name: 'Dr. Sougata Nandy', specialty: 'Cardiology', status: 'Active' },
    { nmcId: 'NMC67890', name: 'Dr. Pratik Kumar', specialty: 'Neurology', status: 'Active' },
    { nmcId: 'NMC11223', name: 'Dr. Vamshi Krishna', specialty: 'General Surgery', status: 'Active' }
];

const registryController = {
    verifyDoctor: (req, res) => {
        const { id } = req.params;
        console.log(`[National Registry] Verification request received for ID: ${id}`);

        const doctor = NATIONAL_DOCTOR_DB.find(d => d.nmcId === id);

        if (doctor) {
            return res.status(200).json({
                success: true,
                provider: "National Medical Commission",
                data: doctor
            });
        }

        res.status(404).json({
            success: false,
            message: "No practitioner found with this registration number."
        });
    }
};

module.exports = registryController;