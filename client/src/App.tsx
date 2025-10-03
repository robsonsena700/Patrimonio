
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Classificacoes from "./pages/Classificacoes";
import Tombamento from "./pages/Tombamento";
import TombamentoPublico from "./pages/TombamentoPublico";
import Alocacao from "./pages/Alocacao";
import Transferencia from "./pages/Transferencia";
import Manutencao from "./pages/Manutencao";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/classificacoes" component={Classificacoes} />
        <Route path="/tombamento" component={Tombamento} />
        <Route path="/tomb/publico/:id" component={TombamentoPublico} />
        <Route path="/alocacao" component={Alocacao} />
        <Route path="/transferencia" component={Transferencia} />
        <Route path="/manutencao" component={Manutencao} />
        <Route path="/:rest*" component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
