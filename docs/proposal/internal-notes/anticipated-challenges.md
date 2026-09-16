# Anticipated Challenges to the CiVentiChem Proposal

Internal notes only, not for client distribution. A red-team pass on the
roadmap and commercial proposal (civentichem-ai-roadmap.vercel.app), grouped
by who is most likely to raise each point.

## From a competing IT/consulting firm

1. **"It's one person. What's your bus factor?"** No redundancy, no bench,
   no escalation path if unavailable, sick, or the relationship needs a
   backup. This is the single easiest attack line for a rival firm.
2. **No company/entity behind the engagement.** No mention of a legal
   entity, professional indemnity insurance, or formal SLA. No contractual
   recourse for CiVentiChem beyond asking for a fix.
3. **Rs 6L looks cheap for AI + GPU infra work.** Risk isn't that it looks
   like bad negotiating, it's that it implies corners get cut, or that real
   cost shows up later via the uncapped hourly maintenance line.

## From a technical/IT evaluator

4. **Zotac as the recommended GPU vendor.** A serious infra reviewer will
   ask why a consumer/gaming GPU brand is recommended instead of
   enterprise-validated hardware (Dell/HP/Lenovo with NVIDIA-certified GPUs)
   with proper support contracts and warranty terms. Fair challenge, have
   an answer ready (e.g. enterprise support isn't warranted at this scale,
   here's the cost delta).
5. **"Prove it's actually air-gapped."** "Fully local" as an assertion in a
   slide isn't an auditable guarantee. Expect a request for firewall rules,
   network traffic logs, or a live demonstration that nothing phones home.
6. **No compliance backing.** If CiVentiChem's own customers require
   data-handling assurances, someone may ask for ISO 27001, SOC 2, or a
   formal security audit, not something a solo consultant typically holds.

## From a sharp CBO or procurement lead

7. **Vague acceptance criteria.** "Deploys the chatbot" / "builds the
   automation" aren't measurable. No defined accuracy bar or definition of
   a bug vs. new scope. Dispute risk at milestone 3 in particular.
8. **Timeline clause only protects one side.** It extends the timeline if
   CiVentiChem is slow to prep data, but says nothing about what happens if
   delivery is late instead. Expect a request for a mirror clause.
9. **Maintenance is an open-ended cost.** "Billed hourly, rate TBD" has no
   cap and no estimate. Put a real rate and a rough monthly range in before
   it's asked.
10. **IP and handover aren't addressed.** No stated code ownership or
    handover terms if the relationship ends after any phase. Likely the
    first thing a legally-minded exec flags.

## Hardest to counter

11. **"Our ERP vendor might just add this as a feature."** Big ERP
    platforms are increasingly bundling AI search/copilot layers. Real
    long-term differentiation risk. Counter: on-prem, zero-egress, and
    built specifically on CiVentiChem's own 40-year archive isn't what a
    generic ERP AI bolt-on does, but say this explicitly, don't wait to be
    asked.

## If fixing only three things before the next conversation

- Add a mirror timeline clause (accountability on both sides, not just
  CiVentiChem's data-prep speed).
- Put a real number (or range) on the hourly maintenance rate.
- Have a one-line, rehearsed answer ready for "what happens if you're
  unavailable."
