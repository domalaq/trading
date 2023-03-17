import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import { useState } from "react";
import CoinsTable from "../src/CoinsTable";
import { Kline } from "../src/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([] as Kline[]);

  const getTrendingCoins = async () => {
    setLoading(true);
    setCoins([]);
    const res = await fetch("/api/trend");

    const data = await res.json();

    const flatData: Kline[] = [];

    data.forEach((d: Kline[]) => d.forEach((t) => flatData.push(t)));

    setCoins(flatData);

    setLoading(false);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          py: 6,
        }}
      >
        <Button
          variant="contained"
          onClick={getTrendingCoins}
          disabled={loading}
        >
          {loading ? "loading" : "get trending coins"}
        </Button>

        {coins.length > 0 ? <CoinsTable rows={coins} /> : null}
      </Box>
    </Container>
  );
}
