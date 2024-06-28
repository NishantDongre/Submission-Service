class TestService {
    constructor() {
        console.log("TestService constructor called");
    }

    async pingCheck() {
        return "pong";
    }
}

module.exports = TestService;
