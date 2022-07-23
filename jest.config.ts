import { getJestProjects } from '@nrwl/jest';

export default {
	clearMocks: true,
	projects: getJestProjects(),
};
