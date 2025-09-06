import React, { useState } from 'react';
import { Plus, Download, Upload, Users, UserCheck, UserX } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Table } from '../components/UI/Table';
import { Modal, FormModal, ConfirmModal } from '../components/UI/Modal';
import { useMembres } from '../hooks/useMembres';
import { useExport } from '../hooks/useExport';
import { Membre, TableColumn } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Membres() {
  const {
    membres,
    filteredMembres,
    stats,
    loading,
    createMembre,
    updateMembre,
    deleteMembre,
    toggleActive,
    searchMembres,
    clearFilters
  } = useMembres();

  const { exportMembresExcel, exportMembresPdf } = useExport();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    adresse: '',
    telephone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Colonnes du tableau
  const columns: TableColumn<Membre>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'w-16'
    },
    {
      key: 'prenom',
      label: 'Prénom',
      sortable: true
    },
    {
      key: 'nom',
      label: 'Nom',
      sortable: true
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (value) => value || '-'
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (value) => value || '-'
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (value) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value) => format(new Date(value), 'dd/MM/yyyy', { locale: fr })
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, membre) => (
        <div className="flex space-x-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleEdit(membre)}
          >
            Modifier
          </Button>
          <Button
            size="xs"
            variant={membre.actif ? 'warning' : 'success'}
            onClick={() => handleToggleActive(membre)}
          >
            {membre.actif ? 'Désactiver' : 'Activer'}
          </Button>
          <Button
            size="xs"
            variant="danger"
            onClick={() => handleDelete(membre)}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  // Gestionnaires d'événements
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    searchMembres({
      search: term,
      actif: undefined
    });
  };

  const handleCreate = () => {
    setFormData({ prenom: '', nom: '', adresse: '', telephone: '' });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (membre: Membre) => {
    setSelectedMembre(membre);
    setFormData({
      prenom: membre.prenom,
      nom: membre.nom,
      adresse: membre.adresse || '',
      telephone: membre.telephone || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDelete = (membre: Membre) => {
    setSelectedMembre(membre);
    setShowDeleteModal(true);
  };

  const handleToggleActive = async (membre: Membre) => {
    await toggleActive(membre.id);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = await createMembre({
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      adresse: formData.adresse.trim() || undefined,
      telephone: formData.telephone.trim() || undefined,
      actif: true
    });

    if (result.success) {
      setShowCreateModal(false);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembre) return;

    setFormErrors({});

    const result = await updateMembre(selectedMembre.id, {
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      adresse: formData.adresse.trim() || undefined,
      telephone: formData.telephone.trim() || undefined
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedMembre(null);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMembre) return;

    const result = await deleteMembre(selectedMembre.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedMembre(null);
    }
  };

  const handleExportExcel = () => {
    exportMembresExcel({ includeInactifs: true });
  };

  const handleExportPdf = () => {
    exportMembresPdf({ includeInactifs: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des membres</h1>
          <p className="text-gray-600 mt-1">
            Gérez les membres de l'association AJCDC
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="secondary"
            icon={<Download />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            icon={<Download />}
            onClick={handleExportPdf}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={handleCreate}
          >
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total membres</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-greenaj" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Membres actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.actifs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-gray-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sans commission</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sansCommission}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, prénom ou téléphone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              clearFilters();
            }}
          >
            Effacer
          </Button>
        </div>
      </div>

      {/* Tableau des membres */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={filteredMembres}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun membre trouvé"
          searchable={false} // Recherche gérée manuellement
        />
      </div>

      {/* Modal de création */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouveau membre"
        onSubmit={handleSubmitCreate}
        loading={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            error={formErrors.prenom}
            required
          />
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            error={formErrors.nom}
            required
          />
        </div>
        <Input
          label="Adresse"
          value={formData.adresse}
          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          error={formErrors.adresse}
          placeholder="Villa, quartier, ville..."
        />
        <Input
          label="Téléphone"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          error={formErrors.telephone}
          placeholder="+221 XX XXX XX XX"
        />
      </FormModal>

      {/* Modal de modification */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMembre(null);
        }}
        title="Modifier le membre"
        onSubmit={handleSubmitEdit}
        loading={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            error={formErrors.prenom}
            required
          />
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            error={formErrors.nom}
            required
          />
        </div>
        <Input
          label="Adresse"
          value={formData.adresse}
          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          error={formErrors.adresse}
          placeholder="Villa, quartier, ville..."
        />
        <Input
          label="Téléphone"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          error={formErrors.telephone}
          placeholder="+221 XX XXX XX XX"
        />
      </FormModal>

      {/* Modal de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMembre(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedMembre?.prenom} ${selectedMembre?.nom} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
