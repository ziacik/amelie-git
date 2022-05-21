const { getJestProjects } = require('@nrwl/jest');

export default {
	clearMocks: true,
	projects: getJestProjects(),
};
