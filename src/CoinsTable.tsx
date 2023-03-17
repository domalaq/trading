import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Kline } from "./types";

interface CoinsTableProps {
  rows: Kline[];
}

export default function CoinsTable(props: CoinsTableProps) {
  const { rows } = props;

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
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <a
                  href={`https://www.gate.io/trade/${row.symbol}`}
                  target="_blank"
                >
                  {row.symbol}
                </a>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
