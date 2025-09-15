import { Card, CardContent } from "@/components/ui/card";

interface PatientProfile {
  gender: string;
  relevant_history: string;
  age: number;
}

interface CaseScenario {
  physical_examination: string;
  patient_profile: PatientProfile;
  history: string;
  initial_investigations: string;
  chief_complaint: string;
}
export default function ClinicalCaseCard({
  caseScenario,
}: {
  caseScenario: CaseScenario;
}) {
  return (
    <Card className="bg-transparent dark:bg-transparent border-none p-0 shadow-none ">
      <CardContent className="space-y-[35px] text-base  p-0 md:text-[15px] text-[13px]  font-medium">
        <div>
          <p>{caseScenario.history}</p>
        </div>

        <div>
          <p>
            <span className="text-[#36AF8D]">Physical Exam</span>{" "}
            <span>{caseScenario.physical_examination}</span>
          </p>
        </div>

        <div>
          <p>
            <span className="text-[#36AF8D]">Investigations</span>{" "}
            {caseScenario?.initial_investigations &&
              (typeof caseScenario.initial_investigations === "object" ? (
                Object.entries(caseScenario.initial_investigations).map(
                  ([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong>{" "}
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </div>
                  )
                )
              ) : (
                <div>{caseScenario.initial_investigations}</div>
              ))}
          </p>
        </div>

        <div>
          <p>
            <span className="text-[#36AF8D]">Complaint</span>{" "}
            {caseScenario.chief_complaint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
