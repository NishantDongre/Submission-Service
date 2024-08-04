const axiosInstance = require("../config/axiosInstance");

const { PROBLEM_ADMIN_SERVICE_URL } = require("../config/serverConfig");

const PROBLEM_ADMIN_API_URL = `${PROBLEM_ADMIN_SERVICE_URL}/api/v1/problems`;

async function fetchProblemDetail(problemId) {
    try {
        const uri = `${PROBLEM_ADMIN_API_URL}/${problemId}`;
        console.log("uri", uri);
        const response = await axiosInstance.get(uri);
        // console.log("response: ", response);
        return response.data;
    } catch (error) {
        console.log(
            "Something went wrong while fetching the problem from Submission-Service"
        );
        console.log(error);
    }
}

module.exports = {
    fetchProblemDetail,
};
