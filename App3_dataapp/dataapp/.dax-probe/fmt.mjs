import { formatValue, convertVbaFormat } from "@microsoft/fabric-visuals-core";
console.log(formatValue(1110.21, "#,0.00"), formatValue(1110231, "#,0"), formatValue(573.197, "#,0.00"));
console.log(JSON.stringify(convertVbaFormat("Long Date")), formatValue(new Date("2026-04-15T00:00:00"), "Long Date"), formatValue("2026-04-15T00:00:00.000", "Long Date"));
console.log(JSON.stringify(convertVbaFormat("mmm d")), JSON.stringify(convertVbaFormat("0")));
