"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Button,
  Card,
  Flex,
  ScrollArea,
  Section,
  Spinner,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { InfoBox } from "@/components/ui/InfoBox";
import { getChain } from "@yodlpay/tokenlists";
import { Address } from "viem";
import { Loader } from "@/components/ui/Loader";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { CodeCopy } from "@/components/ui/CodeCopy";
import { accentColor } from "@/constants";

export function ReadBlockchain() {
  const [ensInput, setEnsInput] = useState<Address | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingEns, setIsLoadingEns] = useState(false);
  const {
    state: { balances, addressFromEns, lastEnsQueried },
    fetchBalances,
    fetchEnsName,
  } = useBlockchain();

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAddress(true);
    if (!address) return;
    await fetchBalances(address);
    setIsLoadingAddress(false);
  };

  const handleAddressChange = (value: string) => {
    setAddress(value as Address);
  };

  const handleEnsLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensInput) return;

    setIsLoadingEns(true);
    const resolvedAddress = await fetchEnsName(ensInput);
    console.log("🚀 resolvedAddress:", resolvedAddress);
    if (resolvedAddress) {
      setAddress(resolvedAddress);
      // await fetchBalances(resolvedAddress);
    }
    setIsLoadingEns(false);
  };

  return (
    <>
      <Section size="1">
        <InfoBox>
          Yapps can use the details provided by the Yodl app to read data from the blockchain.
        </InfoBox>
      </Section>

      <Section size="1">
        <Card>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2">Ens</Text>
              <Flex
                gap="3"
                width="100%"
                // justify="between"
              >
                <TextField.Root
                  size="2"
                  placeholder="vitalik.eth"
                  value={ensInput || ""}
                  onChange={(e) => setEnsInput(e.target.value as Address)}
                />
                <Button size="2" disabled={!ensInput || isLoadingEns} onClick={handleEnsLookup}>
                  {isLoadingEns ? <Spinner size="1" /> : <Text size="1">Lookup ENS</Text>}
                </Button>
              </Flex>
            </Flex>

            {addressFromEns && (
              <Flex direction="column" gap="1">
                <Text as="p" size="2" className="text-start">
                  Address of{" "}
                  <Text as="span" color={accentColor}>
                    {lastEnsQueried}
                  </Text>
                  :
                </Text>
                <ScrollArea scrollbars="horizontal" className="text-xs py-1">
                  <CodeCopy text={addressFromEns} position="back" justify="start" />
                </ScrollArea>
              </Flex>
            )}
          </Flex>
        </Card>
      </Section>

      <Section size="1">
        <Card>
          <Flex direction="column" gap="2">
            <Flex direction="column" gap="1">
              <Text size="2">Address</Text>
              <Flex
                gap="3"
                // width="100%"
                // justify="between"
              >
                <TextField.Root
                  size="2"
                  placeholder="Enter address (0x...)"
                  value={address || ""}
                  onChange={(e) => handleAddressChange(e.target.value)}
                ></TextField.Root>
                <Button
                  size="2"
                  type="submit"
                  disabled={!address || isLoadingAddress}
                  onClick={handleAddressSubmit}
                >
                  {isLoadingAddress ? <Spinner size="1" /> : <Text size="1">Get Balances</Text>}
                </Button>
              </Flex>
            </Flex>

            {balances.length > 0 && (
              <Table.Root size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell justify="center">Chain</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell justify="center">Amount</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell justify="center">Coin</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {balances.map(({ chainId, formatted }) => (
                    <Table.Row key={chainId}>
                      <Table.RowHeaderCell justify="center">
                        <Flex justify="center">
                          <Image
                            src={getChain(chainId).logoUri}
                            alt={getChain(chainId).chainName}
                            width={20}
                            height={20}
                          />
                        </Flex>
                      </Table.RowHeaderCell>
                      <Table.Cell justify="center" className="font-mono ">
                        {formatted.slice(0, 8)}
                      </Table.Cell>
                      <Table.Cell justify="center">
                        <Text>{getChain(chainId).nativeTokenName}</Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Flex>
        </Card>
      </Section>
    </>
  );
}
