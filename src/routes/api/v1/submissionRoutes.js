const {
    createSubmission,
    updateSubmission,
    getAllSubmissionsByUserIdAndProblemId,
    getSubmissionById, 
    getSubmissionAnalyze,
    getSubmissionReview
} = require("../../../controllers/submissionController");

async function submissionRoutes(fastify, options) {
    fastify.post("/", createSubmission);
    fastify.put("/", updateSubmission);
    fastify.get("/", getAllSubmissionsByUserIdAndProblemId);
    fastify.get("/:submissionId", getSubmissionById);
    fastify.get("/:submissionId/analyze", getSubmissionAnalyze);
    fastify.get("/:submissionId/review", getSubmissionReview);


}

module.exports = submissionRoutes;
