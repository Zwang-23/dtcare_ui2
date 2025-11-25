import { fetchVisitsByMrn, fetchPatientByMrn } from './service';

export default class VisitsAI {
  async getVisits(mrn: string) {
    const response = await fetchVisitsByMrn(mrn);
    return response.data;
  }

  async getPatient(lookup: string) {
    const response = await fetchPatientByMrn(lookup);
    return response.data;
  }
}
