export interface BookingIssue {
  _id: string;
  problem: string;
  problemDescription: string;
  solution: string;
  solutionDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingIssueForm {
  problem: string;
  problemDescription: string;
  solution: string;
  solutionDescription: string;
}
