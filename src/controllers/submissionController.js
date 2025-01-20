async function createSubmission(req, res) {
    const response = await this.submissionService.addSubmission(req.body);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Created submission successfully",
    });
}

async function updateSubmission(req, res) {
    const response = await this.submissionService.updateSubmission(req.body);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Updated submission successfully",
    });
}

async function getAllSubmissionsByUserIdAndProblemId(req, res) {
    const response = await this.submissionService.getAllSubmissionsByUserIdAndProblemId(req.query);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Retrived all submissions successfully",
    });
}

async function getSubmissionById(req, res) {
    const response = await this.submissionService.getSubmissionById(req.params.submissionId);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Retrived Submission by ID Successfully",
    });
}

async function getSubmissionAnalyze(req, res){
    const response = await this.submissionService.getSubmissionAnalyze(req.params.submissionId);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Submission Analyzed Successfully",
    });
}

async function getSubmissionReview(req, res){
    const response = await this.submissionService.getSubmissionReview(req.params.submissionId);
    return res.status(201).send({
        error: {},
        data: response,
        success: true,
        message: "Submission Review Successfully",
    });
}

module.exports = {
    createSubmission,
    updateSubmission,
    getAllSubmissionsByUserIdAndProblemId,
    getSubmissionById,
    getSubmissionAnalyze,
    getSubmissionReview
};
