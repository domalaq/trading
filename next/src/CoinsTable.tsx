import {
  Button,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { Kline } from "./types";

interface CoinsTableProps {
  rows: Kline[];
  amount: string;
}

export default function CoinsTable(props: CoinsTableProps) {
  const { rows, amount } = props;

  const [loading, setLoading] = useState(false);
  const [buyPrice, _setBuyPrice] = useState(0);

  const buyOrder = async (currencyPair: string) => {
    setLoading(true);

    try {
      const res = await axios.post("/api/deal", {
        currencyPair,
        amount,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const sellOrder = async (currencyPair: string) => {
    setLoading(true);

    try {
      const res = await axios.post("/api/sell", {
        currencyPair,
        amount,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell align="right">Close Price</TableCell>
            <TableCell align="right">24H High Price</TableCell>
            <TableCell align="right">24H Low Price</TableCell>
            <TableCell align="right">Quote Volume</TableCell>
            <TableCell align="right">Volume 24H</TableCell>
            <TableCell align="right">Oversell Change</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Link
                  href={`https://www.gate.io/trade/${row.symbol}`}
                  target="_blank"
                >
                  {row.symbol}
                </Link>
              </TableCell>
              <TableCell align="right">{row.close}</TableCell>
              <TableCell align="right">
                {row.high24h} (
                {((row.high24h / row.close - 1) * 100).toFixed(1)}%)
              </TableCell>
              <TableCell align="right">
                {row.low24h} ({((1 - row.low24h / row.close) * 100).toFixed(1)}
                %)
              </TableCell>
              <TableCell align="right">{Math.round(row.quoteVolume)}</TableCell>
              <TableCell align="right">{Math.round(row.volume24h)}</TableCell>
              <TableCell align="right">{row.change.toFixed(1)}%</TableCell>
              <TableCell
                sx={{
                  gap: 2,
                  display: "flex",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => buyOrder(row.symbol)}
                  disabled={loading}
                >
                  {loading ? "loading" : `buy ${row.symbol}`}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => buyOrder(row.symbol)}
                  disabled={loading}
                >
                  {loading ? "loading" : `-0.5%`}
                </Button>
                {buyPrice}
                <Button
                  variant="contained"
                  onClick={() => buyOrder(row.symbol)}
                  disabled={loading}
                >
                  {loading ? "loading" : `+0.5%`}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => sellOrder(row.symbol)}
                  disabled={loading}
                >
                  {loading ? "loading" : `sell ${row.symbol}`}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
