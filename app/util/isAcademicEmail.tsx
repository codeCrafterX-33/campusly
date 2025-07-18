const isAcademicEmail = (email: string) => {
  const academicDomains = [
    ".edu", // e.g., example@harvard.edu
    ".ac.", // e.g., example@student.ac.uk or example@ac.jp
    ".edu.cn", // e.g., example@tsinghua.edu.cn
    ".edu.ng", // e.g., example@unilag.edu.ng
    ".ac.kr", // e.g., example@postech.ac.kr
    ".edu.au", // e.g., example@anu.edu.au
    ".edu.ng", // e.g., example@unilag.edu.ng
    ".edu.in", // e.g., example@iitb.edu.in
  ];

  return academicDomains.some((domain) => email.includes(domain));
};

export default isAcademicEmail;

export const isEmailFromSchool = (email: string, schoolDomain: string) => {
  return email.endsWith(`@${schoolDomain}`) || email.includes(schoolDomain);
};
