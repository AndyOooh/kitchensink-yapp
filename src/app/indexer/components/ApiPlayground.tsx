"use client";

import {
  Box,
  Button,
  CheckboxGroup,
  Code,
  Flex,
  ScrollArea,
  Section,
  Text,
  TextField,
  Grid,
  Card,
  Heading,
  Link,
} from "@radix-ui/themes";
import { QueryParamKey, usePlayground } from "../../../providers/PlaygroundProvider";
import { ResponseTable } from "./ResponseTable";
import { buildQueryString, fetchIndexerData } from "@/lib/indexerAapi";
import { INDEXER_URL, SUPPORTED_CHAINS } from "@/constants";
import { CodeCopy } from "@/components/ui/CodeCopy";

type Input = {
  label: string;
  key: QueryParamKey;
  placeholder: string;
  alt?: Input;
  type?: string;
  options?: { label: string; value: string }[];
};

const inputs: Input[] = [
  {
    label: "Sender",
    key: "sender",
    placeholder: "Sender ENS or Address",
  },
  {
    label: "Receiver",
    key: "receiver",
    placeholder: "Receiver ENS or Address",
  },
  {
    label: "Tokens",
    key: "tokenOutSymbols",
    placeholder: "Token Sent Symbols, e.g. ETH, USDC",
  },
  {
    label: "Chains",
    key: "sourceChainIds",
    placeholder: "Source Chain Ids, e.g. 1, 137",
    type: "checkbox",
    options: [
      { label: "All", value: "all" },
      ...SUPPORTED_CHAINS.map((chain) => ({
        label: chain.chainName,
        value: chain.chainId.toString(),
      })),
    ],
  },
];

export function ApiPlayground() {
  const {
    queryParams,
    setQueryParams,
    response,
    setResponse,
    responseStatusCode,
    setResponseStatusCode,
  } = usePlayground();

  const handleInputChange = (key: QueryParamKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (Array.isArray(queryParams[key])) {
      const arrayValue = value ? value.split(",").map((v) => v.trim()) : [];
      setQueryParams({ ...queryParams, [key]: arrayValue });
    } else {
      setQueryParams({ ...queryParams, [key]: value });
    }
  };

  const handleCheckboxChange = (key: QueryParamKey) => (values: string[]) => {
    const currentValues = (queryParams[key] as string[]) || [];
    const lastSelected = values[values.length - 1];
    if (lastSelected === "all") {
      setQueryParams({ ...queryParams, [key]: ["all"] });
    } else if (currentValues.includes("all")) {
      setQueryParams({ ...queryParams, [key]: [lastSelected] });
    } else {
      setQueryParams({ ...queryParams, [key]: values.filter((v) => v !== "all") });
    }
  };

  const isValidRequest = () => {
    return ["sender", "receiver"].some(
      (key) => queryParams[key as QueryParamKey]?.toString().trim() !== ""
    );
  };

  const handleSubmit = async () => {
    setResponseStatusCode(null);
    setResponse(null);
    try {
      const { status, data } = await fetchIndexerData("/payments", queryParams);
      setResponseStatusCode(status);
      setResponse(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResponseStatusCode(500);
    }
  };

  const url = `${INDEXER_URL}/payments${buildQueryString(queryParams)}`;

  return (
    <>
      <Section size="1">
        <Flex direction="column" gap="2">
          <Text as="p" align="center">
            The indexer API let&apos;s yapps query the db for payment history with the{" "}
            <Code>/payments</Code> endpoint. The inputs below show some of the possible filters for
            the query. Full documentation can be found{" "}
            <Link href="" target="_blank">
              here
            </Link>
            . The endpoint returns a paginated list of payments. Try it out below.
          </Text>
        </Flex>
      </Section>

      <Heading as="h3" size="2" align="center" color="gray">
        Fetch payments
      </Heading>

      <Section size="1" pt="1">
        <Card>
          <Flex direction="column" gap="2" align="start">
            {inputs.map((input, index) =>
              input.type === "checkbox" ? (
                <Flex key={input.label} direction="column" gap="1" width="100%">
                  <Text size="2">{input.label}</Text>
                  <CheckboxGroup.Root
                    value={(queryParams[input.key] as string[]) || []}
                    onValueChange={handleCheckboxChange(input.key)}
                    name={input.label}
                  >
                    <Grid columns="3" rows="2" gap="1" width="100%">
                      {input.options?.map((option) => (
                        <CheckboxGroup.Item key={option.value} value={option.value}>
                          <Text size="2" color="gray" className="whitespace-nowrap">
                            {option.label}
                          </Text>
                        </CheckboxGroup.Item>
                      ))}
                    </Grid>
                  </CheckboxGroup.Root>
                </Flex>
              ) : (
                <Flex key={input.label} direction="column" gap="1" width="100%">
                  <Text size="2">{input.label}</Text>
                  <TextField.Root
                    size="2"
                    placeholder={input.placeholder}
                    value={
                      Array.isArray(queryParams[input.key])
                        ? (queryParams[input.key] as string[]).join(", ")
                        : (queryParams[input.key] as string) || ""
                    }
                    onChange={handleInputChange(input.key)}
                  >
                    <TextField.Slot></TextField.Slot>
                  </TextField.Root>
                </Flex>
              )
            )}
            <ScrollArea scrollbars="horizontal" className="text-xs py-1">
              <CodeCopy text={url} position="back" justify="start" />
            </ScrollArea>
            <Button size="2" disabled={!isValidRequest()} onClick={handleSubmit}>
              Submit
            </Button>
          </Flex>
        </Card>
      </Section>

      <Heading as="h3" size="2" align="center" color="gray">
        Inspect response
      </Heading>

      <Section size="1" pt="1">
        <Card>
          <Flex direction="column" gap="2" align="start">
            <Flex gap="2" justify="between" align="center" width="100%">
              <Flex gap="2" align="center">
                <Text size="2">Response:</Text>
                {responseStatusCode && (
                  <Code
                    color={responseStatusCode >= 200 && responseStatusCode < 300 ? "green" : "red"}
                    size="2"
                  >
                    {responseStatusCode}
                  </Code>
                )}
              </Flex>
              <Button size="1" variant="outline" color="gray" onClick={() => setResponse(null)}>
                Clear
              </Button>
            </Flex>
            {response && (
              <Box width="100%">
                <ScrollArea scrollbars="both" className="p-2 w-full max-h-72">
                  <Flex gap="4" p="2" width="700px" className="text-xs">
                    <ResponseTable data={response} isExpanded={true} />
                  </Flex>
                </ScrollArea>
              </Box>
            )}
          </Flex>
        </Card>
      </Section>
    </>
  );
}
