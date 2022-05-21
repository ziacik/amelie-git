const { getJestProjects } = require('@nrwl/jest');

module.exports = {
	clearMocks: true,
	projects: getJestProjects(),
};
