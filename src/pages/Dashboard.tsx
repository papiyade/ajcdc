import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileText, 
  Plus,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { KPICard } from '../components/Dashboard/KPICard';
import { Button } from '../components/UI/Button';
import { useMembres } from '../hooks/useMembres';
import { useCommissions } from '../hooks/useCommissions';
import { usePV } from '../hooks/usePV';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const navigate = useNavigate();
  const { stats: membresStats } = useMembres();
  const { stats: commissionsStats } = useCommissions();
  const { stats: pvStats, recentPV } = usePV();

  const kpiData = [
    {
      title: 'Membres actifs',
      value: membresStats.actifs,
      subtitle: `${membresStats.total} membres au total`,
      icon: Users,
      color: 'primary' as const,
      onClick: () => navigate('/membres')
    },
    {
      title: 'Commissions',
      value: commissionsStats.total,
      subtitle: `${commissionsStats.avecPresident} avec président`,
      icon: Building2,
      color: 'success' as const,
      onClick: () => navigate('/commissions')
    },
    {
      title: 'PV cette année',
      value: pvStats.cetteAnnee,
      subtitle: `${pvStats.total} PV au total`,
      icon: FileText,
      color: 'info' as const,
      onClick: () => navigate('/pv')
    }
  ];

  const quickActions = [
    {
      label: 'Ajouter un membre',
      icon: Users,
      color: 'primary' as const,
      onClick: () => navigate('/membres?action=create')
    },
    {
      label: 'Nouvelle commission',
      icon: Building2,
      color: 'success' as const,
      onClick: () => navigate('/commissions?action=create')
    },
    {
      label: 'Nouveau PV',
      icon: FileText,
      color: 'info' as const,
      onClick: () => navigate('/pv?action=create')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de l'activité de l'association
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            color={kpi.color}
            onClick={kpi.onClick}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Actions rapides
          </h2>
          <Plus className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.color}
              size="lg"
              icon={<action.icon />}
              onClick={action.onClick}
              fullWidth
              className="justify-start"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent PV */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Derniers PV
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pv')}
            >
              Voir tout
            </Button>
          </div>
          
          {recentPV.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun PV enregistré</p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus />}
                onClick={() => navigate('/pv?action=create')}
              >
                Créer le premier PV
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPV.slice(0, 3).map((pv) => (
                <div
                  key={pv.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/pv/${pv.id}`)}
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pv.titre}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {format(new Date(pv.date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {pv.lieu && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500 truncate">
                            {pv.lieu}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Statistiques
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Membres sans commission</span>
              <span className="text-sm font-medium text-gray-900">
                {membresStats.sansCommission}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Commissions sans président</span>
              <span className="text-sm font-medium text-gray-900">
                {commissionsStats.sansPresident}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">PV ce mois</span>
              <span className="text-sm font-medium text-gray-900">
                {pvStats.ceMois}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moyenne membres/commission</span>
              <span className="text-sm font-medium text-gray-900">
                {commissionsStats.moyenneMembresParCommission}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Dernière mise à jour : maintenant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

